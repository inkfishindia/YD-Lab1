
import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Lead, Person } from '../../../types';
import { LeadStatus } from '../../../types';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../../components/Icons';
import { LEAD_STATUS_COLORS } from '../../../constants';

type SortConfig = { key: keyof Lead; direction: 'ascending' | 'descending' } | null;

const LeadInboxPage: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead, people } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({ name: '', brand: '', status: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
        const nameMatch = l.full_name.toLowerCase().includes(filters.name.toLowerCase());
        const brandMatch = l.brand.toLowerCase().includes(filters.brand.toLowerCase());
        const statusMatch = filters.status ? l.status_stage === filters.status : true;
        return nameMatch && brandMatch && statusMatch;
    });
  }, [leads, filters]);

  const sortedLeads = useMemo(() => {
    let sortableLeads = [...filteredLeads];
    if (sortConfig !== null) {
      sortableLeads.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableLeads;
  }, [filteredLeads, sortConfig]);

  const requestSort = (key: keyof Lead) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (lead: Lead | null = null) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingLead(null);
    setIsModalOpen(false);
  };

  const handleSave = (leadData: Omit<Lead, 'lead_id'> | Lead) => {
    if ('lead_id' in leadData) updateLead(leadData);
    else addLead(leadData);
    closeModal();
  };

  const TableHeader: React.FC<{ sortKey: keyof Lead, label: string }> = ({ sortKey, label }) => (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
      </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">Lead Inbox</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Lead
        </Button>
      </div>
      
      <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
          <input type="text" name="name" placeholder="Filter by name..." value={filters.name} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="brand" placeholder="Filter by brand..." value={filters.brand} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {/* FIX: Explicitly type 's' to resolve type inference issue. */}
              {Object.values(LeadStatus).map((s: LeadStatus) => <option key={s} value={s}>{s}</option>)}
          </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="full_name" label="Name" />
              <TableHeader sortKey="brand" label="Brand" />
              <TableHeader sortKey="status_stage" label="Status" />
              <TableHeader sortKey="source_channel" label="Source" />
              <TableHeader sortKey="sdr_owner_fk" label="SDR Owner" />
              <TableHeader sortKey="last_activity_date" label="Last Activity" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedLeads.map((lead) => (
              <tr key={lead.lead_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{lead.full_name}</div>
                  <div className="text-sm text-gray-400">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge text={lead.status_stage} colorClass={LEAD_STATUS_COLORS[lead.status_stage]} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.source_channel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(lead.sdr_owner_fk || '')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.last_activity_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(lead)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteLead(lead.lead_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LeadFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} lead={editingLead} />
    </div>
  );
};

const getInitialLeadData = (people: Person[]): Omit<Lead, 'lead_id'> => ({
    date: new Date().toISOString().split('T')[0],
    full_name: '',
    email: '',
    phone: '',
    brand: '',
    source_channel: '',
    created_at: new Date().toISOString(),
    status_stage: LeadStatus.New,
    sdr_owner_fk: people[0]?.user_id || '',
    last_activity_date: new Date().toISOString().split('T')[0],
    lead_score: '',
    disqualified_reason: '',
    source_campaign_fk: '',
});


const LeadFormModal: React.FC<{isOpen: boolean, onClose: () => void, onSave: (data: any) => void, lead: Lead | null}> = ({ isOpen, onClose, onSave, lead }) => {
    const { people } = useData();
    const [formData, setFormData] = useState(getInitialLeadData(people));

    React.useEffect(() => {
        if (isOpen) {
            if (lead) {
                const { lead_id, ...editableData } = lead;
                setFormData({ ...getInitialLeadData(people), ...editableData });
            } else {
                setFormData(getInitialLeadData(people));
            }
        }
    }, [lead, people, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(lead ? { ...formData, lead_id: lead.lead_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lead ? 'Edit Lead' : 'Add Lead'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Brand</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Phone</label>
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Source Channel</label>
                    <input type="text" name="source_channel" value={formData.source_channel} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">SDR Owner</label>
                    <select name="sdr_owner_fk" value={formData.sdr_owner_fk || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select name="status_stage" value={formData.status_stage} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(LeadStatus).map((s: LeadStatus) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Lead Score</label>
                    <input type="text" name="lead_score" value={formData.lead_score || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Last Activity Date</label>
                    <input type="date" name="last_activity_date" value={formData.last_activity_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="col-span-2 flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LeadInboxPage;
