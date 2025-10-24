
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { BrainDump } from '../../types';
import { Priority } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../components/Icons';
import { PRIORITY_COLORS } from '../../constants';
import BrainDumpFormModal from '../../components/forms/BrainDumpFormModal';

type SortConfig = { key: keyof BrainDump; direction: 'ascending' | 'descending' } | null;

const BrainDumpPage: React.FC = () => {
  const { braindumps, addBrainDump, updateBrainDump, deleteBrainDump } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrainDump | null>(null);
  const [filters, setFilters] = useState({ content: '', type: '', priority: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredItems = useMemo(() => {
    return braindumps.filter(item => {
        return item.content.toLowerCase().includes(filters.content.toLowerCase()) &&
               (filters.type ? item.type.toLowerCase().includes(filters.type.toLowerCase()) : true) &&
               (filters.priority ? item.priority === filters.priority : true);
    });
  }, [braindumps, filters]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  const requestSort = (key: keyof BrainDump) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (item: BrainDump | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSave = (itemData: Omit<BrainDump, 'braindump_id'> | BrainDump) => {
    if ('braindump_id' in itemData) {
        updateBrainDump(itemData);
    } else {
        addBrainDump(itemData);
    }
    closeModal();
  };
  
  const TableHeader: React.FC<{ sortKey: keyof BrainDump, label: string }> = ({ sortKey, label }) => (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
      </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">BrainDump (Quick Capture)</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Item
        </Button>
      </div>
      
      <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
          <input type="text" name="content" placeholder="Filter by content..." value={filters.content} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="type" placeholder="Filter by type..." value={filters.type} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select name="priority" value={filters.priority} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              {/* FIX: Explicitly type 'p' to resolve type inference issue. */}
              {Object.values(Priority).map((p: Priority) => <option key={p} value={p}>{p}</option>)}
          </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="type" label="Type" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/2">Content</th>
              <TableHeader sortKey="user_email" label="User" />
              <TableHeader sortKey="priority" label="Priority" />
              <TableHeader sortKey="timestamp" label="Timestamp" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedItems.map((item) => (
              <tr key={item.braindump_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.type}</td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300">{item.content}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.user_email}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge text={item.priority} colorClass={PRIORITY_COLORS[item.priority]} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(item)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteBrainDump(item.braindump_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BrainDumpFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        item={editingItem} 
      />
    </div>
  );
};

export default BrainDumpPage;