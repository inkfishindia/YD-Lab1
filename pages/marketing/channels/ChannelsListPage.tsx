

import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Channel } from '../../../types';
import Button from '../../../components/ui/Button';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../../components/Icons';
import ChannelFormModal from '../../../components/forms/ChannelFormModal';

type SortConfig = { key: keyof Channel; direction: 'ascending' | 'descending' } | null;

const ChannelsListPage: React.FC = () => {
  const { channels, addChannel, updateChannel, deleteChannel } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [filters, setFilters] = useState<{ name: string; type: string }>({ name: '', type: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredChannels = useMemo(() => {
    return channels.filter(c =>
      c.channel_name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (c.channel_type || '').toLowerCase().includes(filters.type.toLowerCase())
    );
  }, [channels, filters]);

  const sortedChannels = useMemo(() => {
    let sortableChannels = [...filteredChannels];
    if (sortConfig !== null) {
      sortableChannels.sort((a, b) => {
        const valA = a[sortConfig.key] as any;
        const valB = b[sortConfig.key] as any;
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableChannels;
  }, [filteredChannels, sortConfig]);

  const requestSort = (key: keyof Channel) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (channel: Channel | null = null) => {
    setEditingChannel(channel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingChannel(null);
    setIsModalOpen(false);
  };

  const handleSave = (channelData: Omit<Channel, 'channel_id'> | Channel) => {
// FIX: Use an if/else block to ensure proper type narrowing for the 'channelData' parameter, resolving the TypeScript error.
    if ('channel_id' in channelData) {
      updateChannel(channelData as Channel);
    } else {
      addChannel(channelData as Omit<Channel, 'channel_id'>);
    }
    closeModal();
  };
  
  const TableHeader: React.FC<{ sortKey: keyof Channel, label: React.ReactNode }> = ({ sortKey, label }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
    </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">All Channels</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Channel
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
          name="type"
          placeholder="Filter by type..."
          value={filters.type}
          onChange={handleFilterChange}
          className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="channel_name" label="Channel Name" />
              <TableHeader sortKey="channel_type" label="Type" />
              <TableHeader sortKey="focus" label="Focus" />
              <TableHeader sortKey="interfaces" label="Interfaces" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedChannels.map((channel) => (
              <tr key={channel.channel_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{channel.channel_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{channel.channel_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{channel.focus}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{channel.interfaces as React.ReactNode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(channel)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteChannel(channel.channel_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChannelFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        channel={editingChannel} 
      />
    </div>
  );
};

export default ChannelsListPage;