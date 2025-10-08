
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import type { BrainDump, Task } from '../types';
import { Priority } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, TrashIcon, ArrowUpCircleIcon } from '../components/Icons';
import { PRIORITY_COLORS } from '../constants';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import TaskFormModal from '../components/forms/TaskFormModal';

const BrainDumpPage: React.FC = () => {
    const { braindumps, addBrainDump, updateBrainDump, deleteBrainDump, addTask } = useData();
    const { currentUser, isSignedIn } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BrainDump | null>(null);
    const [promotingItem, setPromotingItem] = useState<BrainDump | null>(null);
    const [filter, setFilter] = useState('');

    const filteredAndSortedDumps = useMemo(() => {
        return braindumps
            .filter(item => item.content.toLowerCase().includes(filter.toLowerCase()) || item.type.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [braindumps, filter]);

    const openModal = (item: BrainDump | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = (itemData: Omit<BrainDump, 'braindump_id' | 'timestamp' | 'user_email'> | (Omit<BrainDump, 'timestamp' | 'user_email'>)) => {
        const user_email = currentUser?.email || 'mock.user@example.com';
        const timestamp = new Date().toISOString();

        if ('braindump_id' in itemData) {
            updateBrainDump({ ...itemData, user_email, timestamp });
        } else {
            addBrainDump({ ...itemData, user_email, timestamp });
        }
        closeModal();
    };

    const handlePromoteToTask = async (taskData: Omit<Task, 'task_id'>) => {
        if (!promotingItem) return;
        try {
            await addTask(taskData);
            await deleteBrainDump(promotingItem.braindump_id);
            setPromotingItem(null);
        } catch (error) {
            console.error("Failed to promote braindump item to task", error);
            alert("Could not promote to task. Check console for details.");
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-white">BrainDump</h1>
                <Button onClick={() => openModal()} disabled={!isSignedIn} className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Add Item
                </Button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
                <input
                    type="text"
                    name="filter"
                    placeholder="Filter by content or type..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedDumps.map(item => (
                    <Card key={item.braindump_id} className="flex flex-col !p-0">
                        <div className="p-5 flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-blue-400 bg-blue-900/50 px-2 py-1 rounded">{item.type}</span>
                                <Badge text={item.priority} colorClass={PRIORITY_COLORS[item.priority]} />
                            </div>
                            <p className="text-gray-300 mb-4">{item.content}</p>
                        </div>
                        <div className="bg-gray-950/50 px-5 py-3 flex justify-between items-center mt-auto border-t border-gray-800">
                             <div className="text-xs text-gray-500">
                                <p>{item.user_email}</p>
                                <p>{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button title="Promote to Task" onClick={() => setPromotingItem(item)} disabled={!isSignedIn} className="text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowUpCircleIcon className="w-5 h-5"/></button>
                                <button title="Edit Item" onClick={() => openModal(item)} disabled={!isSignedIn} className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"><EditIcon className="w-5 h-5"/></button>
                                <button title="Delete Item" onClick={() => deleteBrainDump(item.braindump_id)} disabled={!isSignedIn} className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <BrainDumpFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} item={editingItem} />
            <TaskFormModal
                isOpen={!!promotingItem}
                onClose={() => setPromotingItem(null)}
                onSave={handlePromoteToTask}
                task={promotingItem ? {
                    title: promotingItem.content,
                    priority: promotingItem.priority,
                } as Partial<Task> as Task : null}
            />
        </div>
    );
};

const BrainDumpFormModal: React.FC<{isOpen: boolean, onClose: () => void, onSave: (data: any) => void, item: BrainDump | null}> = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({
        type: item?.type || 'Idea',
        content: item?.content || '',
        priority: item?.priority || Priority.Medium,
    });

    React.useEffect(() => {
        setFormData({
            type: item?.type || 'Idea',
            content: item?.content || '',
            priority: item?.priority || Priority.Medium,
        });
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item ? { ...formData, braindump_id: item.braindump_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Item' : 'Add to BrainDump'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-300">Content</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} rows={4} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white" required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300">Type</label>
                        <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="e.g., Idea, Feedback, Note" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BrainDumpPage;
