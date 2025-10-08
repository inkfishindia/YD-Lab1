
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Interface, Person, Flywheel } from '../../../types';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../../components/Icons';

type SortConfig = { key: keyof Interface; direction: 'ascending' | 'descending' } | null;

const AllInterfacesPage: React.FC = () => {
  const { interfaces, addInterface, updateInterface, deleteInterface, people, flywheels } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterface, setEditingInterface] = useState<Interface | null>(null);
  const [filters, setFilters] = useState({ name: '', category: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredInterfaces = useMemo(() => {
    return interfaces.filter(i =>
      i.interface_name.toLowerCase().includes(filters.name.toLowerCase()) &&
      i.interface_category.toLowerCase().includes(filters.category.toLowerCase())
    );
  }, [interfaces, filters]);

  const sortedInterfaces = useMemo(() => {
    let sortableInterfaces = [...filteredInterfaces];
    if (sortConfig !== null) {
      sortableInterfaces.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
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
    if ('interface_id' in ifaceData) {
      updateInterface(ifaceData);
    } else {
      addInterface(ifaceData);
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
              <TableHeader sortKey="interface_owner" label="Owner" />
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(iface.interface_owner)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${iface.monthly_budget.toLocaleString()}</td>
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
      />
    </div>
  );
};

interface InterfaceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    iface: Interface | null;
    people: Person[];
    flywheels: Flywheel[];
}

const InterfaceFormModal: React.FC<InterfaceFormModalProps> = ({ isOpen, onClose, onSave, iface, people, flywheels }) => {
    const { businessUnits } = useData();
    const [formData, setFormData] = useState({
        interface_name: '',
        interface_category: '',
        interface_type: '',
        platform_id: '',
        bu_ids_served: [] as string[],
        flywheel_id: '',
        interface_owner: '',
        monthly_budget: 0,
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                interface_name: iface?.interface_name || '',
                interface_category: iface?.interface_category || '',
                interface_type: iface?.interface_type || '',
                platform_id: iface?.platform_id || '',
                bu_ids_served: iface?.bu_ids_served || [],
                flywheel_id: iface?.flywheel_id || (flywheels[0]?.flywheel_id || ''),
                interface_owner: iface?.interface_owner || (people[0]?.user_id || ''),
                monthly_budget: iface?.monthly_budget || 0,
            });
        }
    }, [iface, people, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'monthly_budget' ? parseFloat(value) : value }));
    };

    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const value: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(iface ? { ...formData, interface_id: iface.interface_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={iface ? 'Edit Interface' : 'Add Interface'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Interface Name</label>
                        <input type="text" name="interface_name" value={formData.interface_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Category</label>
                        <input type="text" name="interface_category" value={formData.interface_category} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Type</label>
                        <input type="text" name="interface_type" value={formData.interface_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Owner</label>
                        <select name="interface_owner" value={formData.interface_owner} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel</label>
                        <select name="flywheel_id" value={formData.flywheel_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {flywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Monthly Budget</label>
                        <input type="number" name="monthly_budget" value={formData.monthly_budget} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Business Units Served</label>
                    <select name="bu_ids_served" multiple value={formData.bu_ids_served} onChange={handleMultiSelectChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white h-32">
                        {businessUnits.map(bu => <option key={bu.bu_id} value={bu.bu_id}>{bu.bu_name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AllInterfacesPage;
