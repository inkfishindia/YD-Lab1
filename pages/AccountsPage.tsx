
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import type { Account } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../components/Icons';

type SortConfig = { key: keyof Account; direction: 'ascending' | 'descending' } | null;

const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, people } = useData();
  const { isSignedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [filters, setFilters] = useState({ name: '', industry: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a =>
      a.account_name.toLowerCase().includes(filters.name.toLowerCase()) &&
      a.industry.toLowerCase().includes(filters.industry.toLowerCase())
    );
  }, [accounts, filters]);
  
  const sortedAccounts = useMemo(() => {
    let sortableAccounts = [...filteredAccounts];
    if (sortConfig !== null) {
      sortableAccounts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAccounts;
  }, [filteredAccounts, sortConfig]);

  const requestSort = (key: keyof Account) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const openModal = (account: Account | null = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleSave = (accountData: Omit<Account, 'account_id'> | Account) => {
    if ('account_id' in accountData) {
      updateAccount(accountData);
    } else {
      addAccount(accountData);
    }
    closeModal();
  };

  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';
  
  const TableHeader: React.FC<{ sortKey: keyof Account, label: string }> = ({ sortKey, label }) => (
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
        <h1 className="text-2xl font-semibold text-white">Accounts</h1>
        <Button onClick={() => openModal()} disabled={!isSignedIn} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Account
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
            name="industry"
            placeholder="Filter by industry..."
            value={filters.industry}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="account_name" label="Account Name" />
              <TableHeader sortKey="industry" label="Industry" />
              <TableHeader sortKey="owner_user_id" label="Owner" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedAccounts.map((account) => (
              <tr key={account.account_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{account.account_name}</div>
                  <a href={`//${account.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{account.website}</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{account.industry}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(account.owner_user_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(account)} disabled={!isSignedIn} className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteAccount(account.account_id)} disabled={!isSignedIn} className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AccountFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} account={editingAccount} />
    </div>
  );
};

const AccountFormModal: React.FC<{isOpen: boolean, onClose: () => void, onSave: (data: any) => void, account: Account | null}> = ({ isOpen, onClose, onSave, account }) => {
    const { people } = useData();
    const [formData, setFormData] = useState({
        account_name: account?.account_name || '',
        industry: account?.industry || '',
        website: account?.website || '',
        owner_user_id: account?.owner_user_id || '',
    });

    React.useEffect(() => {
        setFormData({
            account_name: account?.account_name || '',
            industry: account?.industry || '',
            website: account?.website || '',
            owner_user_id: account?.owner_user_id || (people[0]?.user_id || ''),
        });
    }, [account, people]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(account ? { ...formData, account_id: account.account_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add Account'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Account Name</label>
                    <input type="text" name="account_name" value={formData.account_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Industry</label>
                    <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Website</label>
                    <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="example.com" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Owner</label>
                    <select name="owner_user_id" value={formData.owner_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        <option value="" disabled>Select an Owner</option>
                        {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

export default AccountsPage;
