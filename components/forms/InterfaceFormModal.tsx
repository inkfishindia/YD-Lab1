

import React, { useState, useEffect } from 'react';
import type { Interface, Person, Flywheel, BusinessUnit } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface InterfaceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Interface, 'interface_id'> | Interface) => void;
    iface: Interface | null;
    people: Person[];
    // FIX: Corrected typo from 'Flywheels' to 'Flywheel'.
    flywheels: Flywheel[];
    businessUnits: BusinessUnit[];
}

const getInitialData = (people: Person[], flywheels: Flywheel[]): Partial<Interface> => ({
    interface_name: '',
    interface_category: '',
    interface_type: '',
    serves_flywheels_ids: flywheels[0] ? [flywheels[0].flywheel_id] : [],
    serves_bus_ids: [],
    responsible_person: people[0]?.user_id || '',
    monthly_mau: 0, // Added for InterfaceSchema compatibility
    notes: '',
    monthly_budget: 0, // Added for InterfaceSchema compatibility
    build_status