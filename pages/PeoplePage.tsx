import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Person } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../components/Icons';

type SortConfig = { key: keyof Person; direction: 'ascending' | 'descending' } | null;

const PeoplePage: React.FC = () => {
  const { people, addPerson, updatePerson, deletePerson } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [filters, setFilters] = useState({ name: '', department: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredPeople = useMemo(() => {
    let filterablePeople = [...people];
    if (filters.name) {
      filterablePeople = filterablePeople.filter(p =>
        p.full_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.department) {
      filterablePeople = filterablePeople.filter(p =>
        p.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }
    return filterablePeople;
  }, [people, filters]);
  
  const sortedPeople = useMemo(() => {
    let sortablePeople = [...filteredPeople];
    if (sortConfig !== null) {
      sortablePeople.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePeople;
  }, [filteredPeople, sortConfig]);

  const requestSort = (key: keyof Person) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const openModal = (person: Person | null = null) => {
    setEditingPerson(person);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingPerson(null);
    setIsModalOpen(false);
  };

  const handleSave = (personData: Omit<Person, 'user_id'> | Person) => {
    if ('user_id' in personData) {
      updatePerson(personData);
    } else {
      addPerson(personData);
    }
    closeModal();
  };
  
  const TableHeader: React.FC<{ sortKey: keyof Person, label: string }> = ({ sortKey, label }) => (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">
              {label}
              {sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}
          </div>
      </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">People</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Person
        </Button>
      </div>
      
       <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
        <input
            type="text"
            name="name"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
         <input
            type="text"
            name="department"
            placeholder="Filter by department..."
            value={filters.department}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="full_name" label="Name" />
              <TableHeader sortKey="role_title" label="Role" />
              <TableHeader sortKey="department" label="Department" />
              <TableHeader sortKey="is_active" label="Status" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedPeople.map((person) => (
              <tr key={person.user_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{person.full_name}</div>
                  <div className="text-sm text-gray-400">{person.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{person.role_title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{person.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${person.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                    {person.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(person)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deletePerson(person.user_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PersonFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} person={editingPerson} />
    </div>
  );
};

const PersonFormModal: React.FC<{isOpen: boolean, onClose: () => void, onSave: (data: any) => void, person: Person | null}> = ({ isOpen, onClose, onSave, person }) => {
    const [formData, setFormData] = useState({
        full_name: person?.full_name || '',
        email: person?.email || '',
        department: person?.department || '',
        role_title: person?.role_title || '',
        is_active: person?.is_active ?? true,
    });

    React.useEffect(() => {
        setFormData({
            full_name: person?.full_name || '',
            email: person?.email || '',
            department: person?.department || '',
            role_title: person?.role_title || '',
            is_active: person?.is_active ?? true,
        });
    }, [person]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(person ? { ...formData, user_id: person.user_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={person ? 'Edit Person' : 'Add Person'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white" required />
                </div>
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-300">Department</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white" required />
                </div>
                <div>
                    <label htmlFor="role_title" className="block text-sm font-medium text-gray-300">Role Title</label>
                    <input type="text" name="role_title" value={formData.role_title} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white" required />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"/>
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-300">Active</label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

export default PeoplePage;