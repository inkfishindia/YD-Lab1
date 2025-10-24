import React, { useState, useEffect } from 'react';
import type { AppSheetRow } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface AppSheetRowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppSheetRow) => void;
  initialData: AppSheetRow | null;
  spreadsheetDefs: { code: string; name: string }[];
}

const getInitialFormData = (spreadsheetDefs: { code: string; name: string }[]): Omit<AppSheetRow, '_rowIndex'> => ({
    spreadsheet_name: '',
    spreadsheet_code: spreadsheetDefs[0]?.code || '',
    spreadsheet_id: '',
    sheet_name: '',
    table_alias: '',
    sheet_id: '', // Initialize, though not directly editable
    header: '', // Initialize, though not directly editable
});

const AppSheetRowFormModal: React.FC<AppSheetRowFormModalProps> = ({ isOpen, onClose, onSave, initialData, spreadsheetDefs }) => {
    const [formData, setFormData] = useState<Partial<AppSheetRow>>(getInitialFormData(spreadsheetDefs));

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? initialData : getInitialFormData(spreadsheetDefs));
        }
    }, [initialData, isOpen, spreadsheetDefs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as AppSheetRow);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Sheet Entry' : 'Add New Sheet'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Spreadsheet</label>
                    <select name="spreadsheet_code" value={formData.spreadsheet_code || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        <option value="" disabled>Select a spreadsheet</option>
                        {spreadsheetDefs.map(def => <option key={def.code} value={def.code}>{def.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Sheet Name (Tab Name)</label>
                    <input type="text" name="sheet_name" value={formData.sheet_name || ''} onChange={handleChange} placeholder="Enter the exact sheet name" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                {/* GID field removed as it's now hardcoded in sheetConfig.ts */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AppSheetRowFormModal;