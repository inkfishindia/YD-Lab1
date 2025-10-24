

import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Interface } from '../../../types';
import Button from '../../../components/ui/Button';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../../components/Icons';
import InterfaceFormModal from '../../../components/forms/InterfaceFormModal';

type SortConfig = { key: keyof Interface; direction: 'ascending' | 'descending' } | null;

const AllInterfacesPage: React.FC = () => {
  const { interfaces, addInterface, updateInterface, deleteInterface, people, flywheels, businessUnits } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterface, setEditingInterface] = useState<Interface | null>(null);
  const [filters, setFilters] = useState({ name: '', category: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredInterfaces = useMemo(() => {
    return interfaces.filter(i =>
      i.interface_name.toLowerCase().includes(filters.name.toLowerCase()) &&
// FIX: Add a null check before calling toLowerCase() on a potentially undefined property.
      (i.interface_category ?? '').toLowerCase().includes(filters.category.toLowerCase())
    );
  }, [interfaces, filters]);

  const sortedInterfaces = useMemo(() => {
    let sortableInterfaces = [...filteredInterfaces];
    if (sortConfig !== null) {
      sortableInterfaces.sort((a, b) => {
        const valA = a[sortConfig.key] as any;
        const valB = b[sortConfig.key] as any;
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableInterfaces;
  }, [filteredInterfaces, sortConfig]);

  const requestSort = (key: keyof Interface) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (iface: Interface | null = null) => {
    setEditingInterface(iface);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingInterface(null);
    setIsModalOpen(false);
  };

  const handleSave = (ifaceData: Omit<Interface, 'interface_id'> | Interface) => {
// FIX: Use an if/else block to ensure proper type narrowing for the 'ifaceData' parameter, resolving the TypeScript error.
    if ('interface_id' in ifaceData) {
      updateInterface(ifaceData as Interface);
    } else {
      addInterface(ifaceData as Omit<Interface, 'interface_id'>);
    }
    closeModal();
  };

  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';
  
  const TableHeader: React.FC<{ sortKey: keyof Interface, label: string }> = ({ sortKey, label }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
    </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">All Interfaces</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Interface
        </Button>
      </div>
      
      <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
        <input
          type="text"
          name="name"
          placeholder="Filter by name..."
          value={filters.name}
          onChange={handleFilterChange}
          className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="category"
          placeholder="Filter by category..."
          value={filters.category}
          onChange={handleFilterChange}
          className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="interface_name" label="Interface Name" />
              <TableHeader sortKey="interface_category" label="Category" />
              <TableHeader sortKey="interface_type" label="Type" />
{/* FIX: Corrected property name from 'interface_owner' to 'responsible_person' to match the schema. */}
              <TableHeader sortKey="responsible_person" label="Owner" />
              <TableHeader sortKey="monthly_budget" label="Monthly Budget" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedInterfaces.map((iface) => (
              <tr key={iface.interface_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{iface.interface_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{iface.interface_category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{iface.interface_type}</td>
{/* FIX: Corrected property name from 'interface_owner' to 'responsible_person' to match the schema. */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(iface.responsible_person || '')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${(iface.monthly_budget || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(iface)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteInterface(iface.interface_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InterfaceFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        iface={editingInterface} 
        people={people} 
        flywheels={flywheels}
        businessUnits={businessUnits}
      />
    </div>
  );
};

export default AllInterfacesPage;