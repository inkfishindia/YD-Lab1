import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { SearchIcon, CloseIcon, DocumentTextIcon, FolderIcon, ClipboardCheckIcon, UsersIcon } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_PAGES = [
  { path: '/command-center/dashboard', title: 'Dashboard', category: 'Command Center' },
  { path: '/command-center/executive-dashboard', title: 'Executive Dashboard', category: 'Command Center' },
  { path: '/execution/projects/all', title: 'All Projects', category: 'Execution' },
  { path: '/execution/tasks/all', title: 'All Tasks', category: 'Execution' },
  { path: '/execution/people/directory', title: 'Team Directory', category: 'Execution' },
  { path: '/strategy/foundation/flywheels', title: 'Flywheels Map', category: 'Strategy' },
  { path: '/admin/integrations', title: 'Integrations', category: 'Admin' },
  { path: '/admin/health-check', title: 'Sheet Health Check', category: 'Admin' },
  { path: '/tools/braindump', title: 'BrainDump', category: 'Tools' },
];

type SearchResult = {
  type: 'page' | 'project' | 'task' | 'person';
  id: string;
  title: string;
  path: string;
  category: string;
  icon: React.ElementType;
};

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { projects, tasks, people } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const searchResults = useMemo((): SearchResult[] => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) return [];

    const pageResults: SearchResult[] = ALL_PAGES
      .filter(page => page.title.toLowerCase().includes(lowerSearchTerm) || page.category.toLowerCase().includes(lowerSearchTerm))
      .map(page => ({ type: 'page', id: page.path, title: page.title, path: page.path, category: page.category, icon: DocumentTextIcon }));

    const projectResults: SearchResult[] = projects
      .filter(p => p.project_name.toLowerCase().includes(lowerSearchTerm))
      .map(p => ({ type: 'project', id: p.project_id, title: p.project_name, path: '/execution/projects/all', category: 'Projects', icon: FolderIcon }));
      
    const taskResults: SearchResult[] = tasks
      .filter(t => t.title.toLowerCase().includes(lowerSearchTerm))
      .map(t => ({ type: 'task', id: t.task_id, title: t.title, path: '/execution/tasks/all', category: 'Tasks', icon: ClipboardCheckIcon }));
    
    const peopleResults: SearchResult[] = people
      .filter(p => p.full_name.toLowerCase().includes(lowerSearchTerm))
      .map(p => ({ type: 'person', id: p.user_id, title: p.full_name, path: '/execution/people/directory', category: 'People', icon: UsersIcon }));

    return [...pageResults, ...projectResults, ...taskResults, ...peopleResults];
  }, [searchTerm, projects, tasks, people]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[activeIndex]) {
        handleSelect(searchResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-20 bg-black/70" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for pages, projects, tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-b border-gray-800 text-white py-4 pl-12 pr-4 text-lg focus:outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleSelect(result)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-4 transition-colors ${activeIndex === index ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                  >
                    <result.icon className={`w-5 h-5 flex-shrink-0 ${activeIndex === index ? 'text-white' : 'text-gray-400'}`} />
                    <div className="flex-grow">
                        <span className={`${activeIndex === index ? 'text-white' : 'text-gray-200'}`}>{result.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${activeIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>{result.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="text-center text-gray-400 py-12">No results found.</div>
          ) : (
            <div className="text-center text-gray-500 py-12">Start typing to search...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;