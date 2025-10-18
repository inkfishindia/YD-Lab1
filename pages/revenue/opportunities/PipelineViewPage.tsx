import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Opportunity, Person, Account } from '../../../types';
import { OpportunityStage } from '../../../types';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../../components/Icons';
import { OPPORTUNITY_STAGE_COLORS } from '../../../constants';

type SortConfig = { key: keyof Opportunity; direction: 'ascending' | 'descending' } | null;

const PipelineViewPage: React.FC = () => {
  const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity, people, accounts } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [filters, setFilters] = useState({ name: '', stage: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
        const nameMatch = o.opportunity_name.toLowerCase().includes(filters.name.toLowerCase());
        const stageMatch = filters.stage ? o.stage === filters.stage : true;
        return nameMatch && stageMatch;
    });
  }, [opportunities, filters]);
  
  const sortedOpportunities = useMemo(() => {
    let sortableOpps = [...filteredOpportunities];
    if (sortConfig !== null) {
      sortableOpps.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOpps;
  }, [filteredOpportunities, sortConfig]);

  const requestSort = (key: keyof Opportunity) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (opportunity: Opportunity | null = null) => {
    setEditingOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingOpportunity(null);
    setIsModalOpen(false);
  };

  const handleSave = (oppData: Omit<Opportunity, 'opportunity_id'> | Opportunity) => {
    if ('opportunity_id' in oppData) {
      updateOpportunity(oppData);
    } else {
      addOpportunity(oppData);
    }
    closeModal();
  };
  
  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';
  const getAccountName = (id: string) => accounts.find(a => a.account_id === id)?.account_name || 'N/A';
  
  const TableHeader: React.FC<{ sortKey: keyof Opportunity, label: string, className?: string }> = ({ sortKey, label, className }) => (
      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
      </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">Pipeline View</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Opportunity
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
        <select
            name="stage"
            value={filters.stage}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">All Stages</option>
            {Object.values(OpportunityStage).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="opportunity_name" label="Opportunity Name" className="w-1/3" />
              <TableHeader sortKey="owner_user_id" label="Owner" />
              <TableHeader sortKey="stage" label="Stage" />
              <TableHeader sortKey="amount" label="Amount" />
              <TableHeader sortKey="close_date" label="Close Date" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedOpportunities.map((opp) => (
              <tr key={opp.opportunity_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{opp.opportunity_name}</div>
                    <div className="text-sm text-gray-400">{getAccountName(opp.account_id)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(opp.owner_user_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge text={opp.stage} colorClass={OPPORTUNITY_STAGE_COLORS[opp.stage]} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">₹{opp.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{opp.close_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(opp)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteOpportunity(opp.opportunity_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OpportunityFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} opportunity={editingOpportunity} />
    </div>
  );
};

const getInitialOpportunityData = (people: Person[], accounts: Account[]): Omit<Opportunity, 'opportunity_id'> => ({
    opportunity_name: '',
    account_id: accounts[0]?.account_id || '',
    stage: OpportunityStage.Prospecting,
    amount: 0,
    close_date: '',
    owner_user_id: people[0]?.user_id || '',
});

const OpportunityFormModal: React.FC<{isOpen: boolean, onClose: () => void, onSave: (data: any) => void, opportunity: Opportunity | null}> = ({ isOpen, onClose, onSave, opportunity }) => {
    const { people, accounts } = useData();
    const [formData, setFormData] = useState(getInitialOpportunityData(people, accounts));

    React.useEffect(() => {
        if (isOpen) {
            if (opportunity) {
                const { opportunity_id, ...editableData } = opportunity;
                setFormData(editableData);
            } else {
                setFormData(getInitialOpportunityData(people, accounts));
            }
        }
    }, [opportunity, people, accounts, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(opportunity ? { ...formData, opportunity_id: opportunity.opportunity_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={opportunity ? 'Edit Opportunity' : 'Add Opportunity'}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Opportunity Name</label>
                    <input type="text" name="opportunity_name" value={formData.opportunity_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Account</label>
                    <select name="account_id" value={formData.account_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        <option value="" disabled>Select an Account</option>
                        {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.account_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Owner</label>
                    <select name="owner_user_id" value={formData.owner_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        <option value="" disabled>Select an Owner</option>
                        {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Stage</label>
                    <select name="stage" value={formData.stage} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(OpportunityStage).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Amount</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Close Date</label>
                    <input type="date" name="close_date" value={formData.close_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="col-span-2 flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PipelineViewPage;
