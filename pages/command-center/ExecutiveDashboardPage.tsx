import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Person, Project, Task, BusinessUnit } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { STATUS_COLORS, SYSTEM_STATUS_COLORS } from '../../constants';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';
import { BusinessUnitFormModal } from '../../components/forms/BusinessUnitFormModal';
import ProjectFormModal from '../../components/forms/ProjectFormModal';
import TaskFormModal from '../../components/forms/TaskFormModal';

const combinedStatusColors = { ...STATUS_COLORS, ...SYSTEM_STATUS_COLORS };

const ExecutiveDashboardPage: React.FC = () => {
    const { 
        businessUnits, addBusinessUnit, updateBusinessUnit, deleteBusinessUnit,
        projects, addProject, updateProject, deleteProject,
        tasks, addTask, updateTask, deleteTask,
        people 
    } = useData();

    // Selection State
    const [selectedBuId, setSelectedBuId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Modal and Editing State
    const [buModal, setBuModal] = useState<{isOpen: boolean, data: BusinessUnit | null}>({isOpen: false, data: null});
    const [projectModal, setProjectModal] = useState<{isOpen: boolean, data: Project | null}>({isOpen: false, data: null});
    const [taskModal, setTaskModal] = useState<{isOpen: boolean, data: Task | null}>({isOpen: false, data: null});

    const handleBuSelect = (buId: string) => {
        setSelectedBuId(current => (current === buId ? null : buId));
        setSelectedProjectId(null);
        setSelectedTaskId(null);
    };

    const handleProjectSelect = (projectId: string) => {
        setSelectedProjectId(current => (current === projectId ? null : projectId));
        setSelectedTaskId(null);
    };

    const handleTaskSelect = (taskId: string) => {
        setSelectedTaskId(current => (current === taskId ? null : taskId));
    };
    
    // --- Save Handlers ---
    const handleSaveBu = (data: Omit<BusinessUnit, 'bu_id'> | BusinessUnit) => {
        // FIX: Use an if/else block to ensure proper type narrowing for the 'data' parameter when calling updateBusinessUnit and addBusinessUnit, resolving a TypeScript error.
        if ('bu_id' in data) {
            updateBusinessUnit(data as BusinessUnit);
        } else {
            addBusinessUnit(data as Omit<BusinessUnit, 'bu_id'>);
        }
        setBuModal({isOpen: false, data: null});
    };
    const handleSaveProject = (data: Omit<Project, 'project_id'> | Project) => {
        // FIX: The business_unit_id property expects a string array. Encapsulate selectedBuId in an array.
        const payload = 'project_id' in data ? data : { ...data, business_unit_id: selectedBuId ? [selectedBuId] : [] };
        if ('project_id' in payload) updateProject(payload as Project);
        else addProject(payload as Omit<Project, 'project_id'>);
        setProjectModal({isOpen: false, data: null});
    };
    const handleSaveTask = (data: Omit<Task, 'task_id'> | Task) => {
        const payload = 'task_id' in data ? data : { ...data, project_id: selectedProjectId! };
        if ('task_id' in payload) updateTask(payload as Task);
        else addTask(payload as Omit<Task, 'task_id'>);
        setTaskModal({isOpen: false, data: null});
    };

    const filteredProjects = useMemo(() => {
        if (!selectedBuId) return [];
        // FIX: Use .includes() to check if the string ID is present in the string array.
        return projects.filter(p => p.business_unit_id && p.business_unit_id.includes(selectedBuId));
    }, [selectedBuId, projects]);

    const filteredTasks = useMemo(() => {
        if (!selectedProjectId) return [];
        return tasks.filter(t => t.project_id === selectedProjectId);
    }, [selectedProjectId, tasks]);

    const relatedPeople = useMemo(() => {
        const peopleMap = new Map<string, Person>();
        const addPerson = (userId: string | undefined | null) => {
            if (!userId) return;
            // Use personId if available, fallback to user_id for Person/SystemPerson compatibility
            const person = people.find(p => p.personId === userId || p.user_id === userId);
            if (person && !peopleMap.has(person.personId || person.user_id!)) peopleMap.set(person.personId || person.user_id!, person);
        };

        // FIX: Corrected property name from 'owner_user_id' to 'owner_person_id' to match the 'BusinessUnit' type definition.
        if (selectedBuId) addPerson(businessUnits.find(b => b.businessUnitId === selectedBuId)?.owner_person_id);
        if (selectedProjectId) addPerson(projects.find(p => p.project_id === selectedProjectId)?.owner_user_id);
        if (selectedTaskId) addPerson(tasks.find(t => t.task_id === selectedTaskId)?.assignee_user_id);

        return Array.from(peopleMap.values());
    }, [selectedBuId, selectedProjectId, selectedTaskId, people, businessUnits, projects, tasks]);

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
                        {detailKey && item[detailKey] && <div className="text-sm text-gray-400 mt-1"><Badge text={item[detailKey]} colorClass={combinedStatusColors[item[detailKey]]} /></div>}
                        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1 text-blue-400 hover:text-blue-300 bg-gray-900/50 rounded"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item[idKey] as string); }} className="p-1 text-red-400 hover:text-red-300 bg-gray-900/50 rounded"><TrashIcon className="w-4 h-4" /></button>
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
                    <div key={person.personId} className="p-3 rounded-md bg-gray-800">
                        <p className="font-medium text-white truncate">{person.fullName}</p>
                        <p className="text-sm text-gray-400 truncate">{person.role}</p>
                    </div>
                )) : <p className="text-gray-500 text-center p-4">No people to display.</p>}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-semibold text-white mb-4">Executive Dashboard</h1>
            <p className="text-gray-400 mb-4 -mt-2 text-sm">Click an item to drill down. Hover to reveal edit/delete actions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                {renderColumn<BusinessUnit>('Business Units', businessUnits, selectedBuId, handleBuSelect, 'businessUnitId', 'businessUnitName', 
                    () => setBuModal({isOpen: true, data: null}),
                    (bu) => setBuModal({isOpen: true, data: bu}),
                    deleteBusinessUnit, false, 'status'
                )}
                {renderColumn<Project>('Projects', filteredProjects, selectedProjectId, handleProjectSelect, 'project_id', 'project_name', 
                    () => setProjectModal({isOpen: true, data: null}),
                    (proj) => setProjectModal({isOpen: true, data: proj}),
                    deleteProject, !selectedBuId, 'status'
                )}
                {renderColumn<Task>('Tasks', filteredTasks, selectedTaskId, handleTaskSelect, 'task_id', 'title',
                    () => setTaskModal({isOpen: true, data: null}),
                    (task) => setTaskModal({isOpen: true, data: task}),
                    deleteTask, !selectedProjectId, 'status'
                )}
                {renderPeopleColumn()}
            </div>
            
            <BusinessUnitFormModal
                isOpen={buModal.isOpen}
                onClose={() => setBuModal({isOpen: false, data: null})}
                onSave={handleSaveBu}
                businessUnit={buModal.data}
            />
            <ProjectFormModal
                isOpen={projectModal.isOpen}
                onClose={() => setProjectModal({isOpen: false, data: null})}
                onSave={handleSaveProject}
                project={projectModal.data}
            />
            <TaskFormModal
                isOpen={taskModal.isOpen}
                onClose={() => setTaskModal({isOpen: false, data: null})}
                onSave={handleSaveTask}
                task={taskModal.data}
            />
        </div>
    );
};

export default ExecutiveDashboardPage;