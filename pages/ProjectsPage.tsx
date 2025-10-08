import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Project, Person, Task } from '../types';
import { Priority, Status } from '../types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { PlusIcon, EditIcon, TrashIcon, SortIcon, UsersIcon, ClipboardCheckIcon, FolderIcon } from '../components/Icons';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import ProjectFormModal from '../components/forms/ProjectFormModal';

type SortConfig = { key: keyof Project; direction: 'ascending' | 'descending' } | null;

const ProjectsPage: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, people, businessUnits, tasks } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState({ name: '', status: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
        const nameMatch = p.project_name.toLowerCase().includes(filters.name.toLowerCase());
        const statusMatch = filters.status ? p.status === filters.status : true;
        return nameMatch && statusMatch;
    });
  }, [projects, filters]);
  
  const sortedProjects = useMemo(() => {
    let sortableProjects = [...filteredProjects];
    if (sortConfig !== null) {
      sortableProjects.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProjects;
  }, [filteredProjects, sortConfig]);

  const requestSort = (key: keyof Project) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (project: Project | null = null) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleSave = (projectData: Omit<Project, 'project_id'> | Project) => {
    if ('project_id' in projectData) {
      updateProject(projectData);
    } else {
      addProject(projectData);
    }
    closeModal();
  };
  
  const handleRowClick = (project: Project) => {
    if (selectedProject?.project_id === project.project_id) {
      setSelectedProject(null);
    } else {
      setSelectedProject(project);
    }
  };

  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';
  const getBuName = (id: string) => businessUnits.find(bu => bu.bu_id === id)?.bu_name || 'N/A';
  
  const TableHeader: React.FC<{ sortKey: keyof Project, label: string, className?: string }> = ({ sortKey, label, className }) => (
      <th scope="col" className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
      </th>
  );
  
  const relatedTasks = useMemo(() => {
    if (!selectedProject) return [];
    return tasks.filter(task => task.project_id === selectedProject.project_id)
        .sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [selectedProject, tasks]);

  const relatedPeople = useMemo(() => {
    if (!selectedProject) return [];
    const peopleMap = new Map<string, { person: Person; roles: string[] }>();

    const addPerson = (userId: string | undefined, role: string) => {
        if (!userId) return;
        const person = people.find(p => p.user_id === userId);
        if (person) {
            if (peopleMap.has(userId)) {
                const existing = peopleMap.get(userId)!;
                if (!existing.roles.includes(role)) {
                    existing.roles.push(role);
                }
            } else {
                peopleMap.set(userId, { person, roles: [role] });
            }
        }
    };

    addPerson(selectedProject.owner_user_id, 'Owner');
    relatedTasks.forEach(task => addPerson(task.assignee_user_id, 'Assignee'));

    return Array.from(peopleMap.values());
  }, [selectedProject, relatedTasks, people]);


  return (
    <div className="h-full flex gap-6">
      <div className="w-3/5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Add Project
          </Button>
        </div>

        <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
          <input
              type="text" name="name" placeholder="Filter by name..." value={filters.name} onChange={handleFilterChange}
              className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
              name="status" value={filters.status} onChange={handleFilterChange}
              className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
              <option value="">All Statuses</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-auto flex-1">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <TableHeader sortKey="project_name" label="Project" className="w-2/5" />
                <TableHeader sortKey="owner_user_id" label="Owner" />
                <TableHeader sortKey="status" label="Status" />
                <TableHeader sortKey="target_end_date" label="End Date" />
                <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedProjects.map((project) => (
                <tr key={project.project_id} 
                    onClick={() => handleRowClick(project)}
                    className={`cursor-pointer ${selectedProject?.project_id === project.project_id ? 'bg-blue-900/40' : 'hover:bg-gray-800'}`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{project.project_name}</div>
                      <div className="text-sm text-gray-400">{getBuName(project.business_unit_id)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(project.owner_user_id)}</td>
                  <td className="px-4 py-4 whitespace-nowrap"><Badge text={project.status} colorClass={STATUS_COLORS[project.status]} /></td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{project.target_end_date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="relative z-10 flex items-center gap-4">
                      <button onClick={(e) => { e.stopPropagation(); openModal(project); }} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProject(project.project_id); }} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="w-2/5 flex flex-col">
        {selectedProject ? (
            <Card className="h-full flex-1 flex flex-col">
                <div className="p-5 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-1">{selectedProject.project_name}</h3>
                    <p className="text-sm text-gray-400">Business Unit: {getBuName(selectedProject.business_unit_id)}</p>
                    <div className="flex gap-4 mt-3">
                        <Badge text={selectedProject.status} colorClass={STATUS_COLORS[selectedProject.status]} />
                        <Badge text={selectedProject.priority} colorClass={PRIORITY_COLORS[selectedProject.priority]} />
                    </div>
                     <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>Budget</span>
                           <span>${selectedProject.budget_spent.toLocaleString()} / ${selectedProject.budget_planned.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${(selectedProject.budget_spent/selectedProject.budget_planned)*100}%`}}></div>
                        </div>
                    </div>
                </div>
                <div className="p-5 overflow-y-auto flex-1">
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center"><ClipboardCheckIcon className="w-5 h-5 mr-2 text-gray-400"/>Tasks ({relatedTasks.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {relatedTasks.length > 0 ? relatedTasks.map(task => (
                            <div key={task.task_id} className="p-2 bg-gray-800/50 rounded-md">
                                <p className="text-sm text-white font-medium">{task.title}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400">{getPersonName(task.assignee_user_id)}</span>
                                    <Badge text={task.status} colorClass={STATUS_COLORS[task.status]} />
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500">No tasks for this project.</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center"><UsersIcon className="w-5 h-5 mr-2 text-gray-400"/>People ({relatedPeople.length})</h4>
                     <div className="space-y-2">
                        {relatedPeople.map(({person, roles}) => (
                           <div key={person.user_id} className="p-2 bg-gray-800/50 rounded-md flex justify-between items-center">
                               <div>
                                  <p className="text-sm text-white font-medium">{person.full_name}</p>
                                  <p className="text-xs text-gray-400">{person.role_title}</p>
                               </div>
                               <span className="text-xs text-blue-400 bg-blue-900/50 px-2 py-1 rounded">{roles.join(', ')}</span>
                           </div>
                        ))}
                    </div>
                  </div>
                </div>
            </Card>
        ) : (
            <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                    <FolderIcon className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-white">No Project Selected</h3>
                    <p className="mt-1 text-sm text-gray-500">Select a project from the list to see its details.</p>
                </div>
            </Card>
        )}
      </div>

      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        project={editingProject} 
      />
    </div>
  );
};

export default ProjectsPage;
