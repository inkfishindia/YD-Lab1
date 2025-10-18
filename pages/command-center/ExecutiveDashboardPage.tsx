import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import type { Person, BusinessUnit } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { STATUS_COLORS } from '../../constants';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';
import BusinessUnitFormModal from '../../components/forms/BusinessUnitFormModal';

const ExecutiveDashboardPage: React.FC = () => {
    const { 
        businessUnits, addBusinessUnit, updateBusinessUnit, deleteBusinessUnit,
        people 
    } = useData();

    // Selection State
    const [selectedBuId, setSelectedBuId] = useState<string | null>(null);

    // Modal and Editing State
    const [buModal, setBuModal] = useState<{isOpen: boolean, data: BusinessUnit | null}>({isOpen: false, data: null});

    const handleBuSelect = (buId: string) => {
        setSelectedBuId(current => (current === buId ? null : buId));
    };
    
    // --- Save Handlers ---
    const handleSaveBu = (data: Omit<BusinessUnit, 'bu_id'> | BusinessUnit) => {
        if ('bu_id' in data) updateBusinessUnit(data);
        else addBusinessUnit(data);
        setBuModal({isOpen: false, data: null});
    };

    const relatedPeople = useMemo(() => {
        if (!selectedBuId) return [];
        const bu = businessUnits.find(b => b.bu_id === selectedBuId);
        if (!bu || !bu.owner_user_id) return [];
        const owner = people.find(p => p.user_id === bu.owner_user_id);
        return owner ? [owner] : [];
    }, [selectedBuId, people, businessUnits]);


    const renderColumn = <T extends { [key: string]: any }>(
        title: string, items: T[], selectedId: string | null, onSelect: (id: string) => void,
        idKey: keyof T, nameKey: keyof T, onAdd: () => void, onEdit: (item: T) => void,
        onDelete: (id: string) => void, addDisabled: boolean = false, detailKey?: keyof T
    ) => (
        <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <Button onClick={onAdd} disabled={addDisabled} variant="secondary" className="!p-2">
                    <PlusIcon className="w-5 h-5" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {items.length > 0 ? items.map(item => (
                    <div
                        key={item[idKey]}
                        onClick={() => onSelect(item[idKey])}
                        className={`group p-3 rounded-md cursor-pointer transition-colors relative ${selectedId === item[idKey] ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-800 hover:bg-gray-700 border border-transparent'}`}
                    >
                        <p className="font-medium text-white truncate">{item[nameKey]}</p>
                        {detailKey && <div className="text-sm text-gray-400 mt-1"><Badge text={item[detailKey]} colorClass={STATUS_COLORS[item[detailKey]]} /></div>}
                        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1 text-blue-400 hover:text-blue-300 bg-gray-900/50 rounded"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item[idKey]); }} className="p-1 text-red-400 hover:text-red-300 bg-gray-900/50 rounded"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center p-4">{addDisabled ? 'Select an item from the left.' : 'No items yet.'}</p>}
            </div>
        </div>
    );
    
     const renderPeopleColumn = () => (
        <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-800">Related People</h2>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {relatedPeople.length > 0 ? relatedPeople.map(person => (
                    <div key={person.user_id} className="p-3 rounded-md bg-gray-800">
                        <p className="font-medium text-white truncate">{person.full_name}</p>
                        <p className="text-sm text-gray-400 truncate">{person.role_title}</p>
                    </div>
                )) : <p className="text-gray-500 text-center p-4">No people to display.</p>}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-semibold text-white mb-4">Executive Dashboard</h1>
            <p className="text-gray-400 mb-4 -mt-2 text-sm">Click a Business Unit to see related people. Hover to reveal edit/delete actions.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                {renderColumn('Business Units', businessUnits, selectedBuId, handleBuSelect, 'bu_id', 'bu_name', 
                    () => setBuModal({isOpen: true, data: null}),
                    (bu) => setBuModal({isOpen: true, data: bu}),
                    deleteBusinessUnit
                )}
                {renderPeopleColumn()}
            </div>
            
            <BusinessUnitFormModal
                isOpen={buModal.isOpen}
                onClose={() => setBuModal({isOpen: false, data: null})}
                onSave={handleSaveBu}
                businessUnit={buModal.data}
            />
        </div>
    );
};

export default ExecutiveDashboardPage;