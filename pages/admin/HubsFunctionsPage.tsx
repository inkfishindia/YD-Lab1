
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import type { Hub } from '../../types';
import Button from '../../components/ui/Button';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../components/Icons';
import HubFormModal from '../../components/forms/HubFormModal';

type SortConfig = { key: keyof Hub; direction: 'ascending' | 'descending' } | null;

const HubsFunctionsPage: React.FC = () => {
  const { hubs, addHub, updateHub, deleteHub, people, flywheels } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [filters, setFilters] = useState({ name: '', category: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredHubs = useMemo(() => {
    return hubs.filter(h =>
      h.hub_name.toLowerCase().includes(filters.name.toLowerCase()) &&
      h.function_category.toLowerCase().includes(filters.category.toLowerCase())
    );
  }, [hubs, filters]);

  const sortedHubs = useMemo(() => {
    let sortableHubs = [...filteredHubs];
    if (sortConfig !== null) {
      sortableHubs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableHubs;
  }, [filteredHubs, sortConfig]);

  const requestSort = (key: keyof Hub) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (hub: Hub | null = null) => {
    setEditingHub(hub);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingHub(null);
    setIsModalOpen(false);
  };

  const handleSave = (hubData: Omit<Hub, 'hub_id'> | Hub) => {
    if ('hub_id' in hubData) updateHub(hubData);
    else addHub(hubData);
    closeModal();
  };
  
  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';
  
  const TableHeader: React.FC<{ sortKey: keyof Hub, label: string }> = ({ sortKey, label }) => (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
      </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">Hubs & Functions</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Hub
        </Button>
      </div>
      
       <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
        <input
            type="text"
            name="name"
            placeholder="Filter by hub name..."
            value={filters.name}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
         <input
            type="text"
            name="category"
            placeholder="Filter by function category..."
            value={filters.category}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="hub_name" label="Hub Name" />
              <TableHeader sortKey="function_category" label="Function Category" />
              <TableHeader sortKey="owner_user_id" label="Owner" />
              <TableHeader sortKey="monthly_budget" label="Monthly Budget" />
              <TableHeader sortKey="hiring_priority" label="Hiring Priority" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedHubs.map((hub) => (
              <tr key={hub.hub_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{hub.hub_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{hub.function_category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(hub.owner_user_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">₹{hub.monthly_budget.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{hub.hiring_priority}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(hub)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteHub(hub.hub_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <HubFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        hub={editingHub}
        people={people}
        flywheels={flywheels}
      />
    </div>
  );
};

export default HubsFunctionsPage;
