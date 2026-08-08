import { useState } from 'react';
import { Plus, Trash2, CheckSquare, DollarSign, Search, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Label } from '@/shared/components/ui/Label';
import { Select } from '@/shared/components/ui/Select';
import { MOCK_LIBRARY, MOCK_PROJECT_SCOPE } from '@/services/mock/mockData';

// Local interface for Task Definition within a Project
interface ProjectTaskDef {
    id: string;
    originalLibraryId?: string;
    name: string;
    description: string;
    category: string;
    pricingType: 'fixed' | 'hourly' | 'hidden';
    internalValue: number; // Unit price or hourly rate
    estimatedHours?: number;
    assignedInstances: number; // Count of active assignments
}

export function ProjectTasks() {
    // Mock Data
    const [tasks, setTasks] = useState<ProjectTaskDef[]>(MOCK_PROJECT_SCOPE as unknown as ProjectTaskDef[]);

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<ProjectTaskDef | null>(null);
    const [librarySearch, setLibrarySearch] = useState('');

    // Form State for New Task Definition
    const [newTask, setNewTask] = useState<Partial<ProjectTaskDef>>({
        name: '',
        category: 'General',
        pricingType: 'fixed',
        internalValue: 0,
        estimatedHours: 0
    });

    const filteredLibrary = MOCK_LIBRARY.filter(task =>
        task.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
        task.category.toLowerCase().includes(librarySearch.toLowerCase())
    );

    // -- Task Definition Logic --

    const handleImportFromLibrary = (libTask: typeof MOCK_LIBRARY[0]) => {
        setNewTask({
            originalLibraryId: libTask.id,
            name: libTask.name,
            description: libTask.description,
            category: libTask.category,
            pricingType: 'fixed', // Default
            internalValue: libTask.internalCost,
            estimatedHours: 4 // Default estimate
        });
        // We stay in the modal to let user refine details (pricing type, etc)
    };

    const handleCreateTaskDef = () => {
        if (!newTask.name) return;
        const task: ProjectTaskDef = {
            id: Date.now().toString(),
            name: newTask.name,
            description: newTask.description || '',
            category: newTask.category || 'General',
            pricingType: newTask.pricingType || 'fixed',
            internalValue: newTask.internalValue || 0,
            estimatedHours: newTask.estimatedHours || 0,
            assignedInstances: 0,
            originalLibraryId: newTask.originalLibraryId
        };
        setTasks([...tasks, task]);
        setIsAddModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewTask({ name: '', category: 'General', pricingType: 'fixed', internalValue: 0, estimatedHours: 0 });
        setLibrarySearch('');
    };

    const handleDelete = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    // -- Assignment Logic --

    const openAssignModal = (task: ProjectTaskDef) => {
        setSelectedTaskForAssignment(task);
        setIsAssignModalOpen(true);
    };

    const handleAssignConfirm = () => {
        // Mock assignment logic
        if (selectedTaskForAssignment) {
            const updatedTasks = tasks.map(t =>
                t.id === selectedTaskForAssignment.id
                    ? { ...t, assignedInstances: t.assignedInstances + 1 }
                    : t
            );
            setTasks(updatedTasks);
        }
        setIsAssignModalOpen(false);
        setSelectedTaskForAssignment(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Defined Project Tasks</h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight font-bold">Define scope & standard pricing for this project</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Task Definition
                </Button>
            </div>

            {/* Task Definition / Import Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                title="Define Project Task"
                maxWidth="2xl"
            >
                <div className="space-y-6">
                    {/* Library Import Section */}
                    {!newTask.name && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                Import from Global Library
                            </h4>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    placeholder="Search standard tasks..."
                                    value={librarySearch}
                                    onChange={(e) => setLibrarySearch(e.target.value)}
                                    className="pl-9 h-9 text-sm bg-white"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {filteredLibrary.slice(0, 5).map(lib => (
                                    <button
                                        key={lib.id}
                                        onClick={() => handleImportFromLibrary(lib)}
                                        className="flex-shrink-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:border-blue-400 hover:bg-blue-50 transition-all text-left min-w-[120px]"
                                    >
                                        <div className="font-bold text-gray-800 truncate">{lib.name}</div>
                                        <div className="text-gray-500">${lib.internalCost}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Task Details Form */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Task Name</Label>
                            <Input
                                value={newTask.name}
                                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                placeholder="e.g. Install Kitchen Cabinets"
                                className="font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                                value={newTask.category}
                                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                placeholder="e.g. Carpentry"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Pricing Type</Label>
                            <Select
                                value={newTask.pricingType}
                                onChange={(val) => setNewTask({ ...newTask, pricingType: val as any })}
                                options={[
                                    { value: 'fixed', label: 'Fixed Unit Price' },
                                    { value: 'hourly', label: 'Hourly Rate' },
                                    { value: 'hidden', label: 'Hidden (Internal Only)' }
                                ]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Internal Value ($)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={newTask.internalValue}
                                    onChange={(e) => setNewTask({ ...newTask, internalValue: parseFloat(e.target.value) })}
                                    className="pl-8"
                                />
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Est. Time (Hours)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={newTask.estimatedHours}
                                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })}
                                    className="pl-8"
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Instructions for the worker..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateTaskDef} disabled={!newTask.name}>Save Definition</Button>
                    </div>
                </div>
            </Modal>

            {/* Assignment Stub Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title={`Assign: ${selectedTaskForAssignment?.name}`}
                maxWidth="md"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        Assigning task <strong>{selectedTaskForAssignment?.name}</strong> to specific project locations and workers.
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Floor / location</Label>
                            <Select
                                options={[
                                    { value: 'all', label: 'All Floors' },
                                    { value: 'f1', label: 'Floor 1' },
                                    { value: 'f2', label: 'Floor 2' }
                                ]}
                                placeholder="Select Floor"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Select Room (Optional)</Label>
                            <Select
                                options={[
                                    { value: 'all', label: 'All Rooms' },
                                    { value: 'r101', label: 'Room 101' },
                                    { value: 'r102', label: 'Room 102' }
                                ]}
                                placeholder="Select Room"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Worker (Optional)</Label>
                            <Select
                                options={[
                                    { value: 'unassigned', label: 'Unassigned (Open)' },
                                    { value: 'w1', label: 'John Doe (Electrician)' },
                                    { value: 'w2', label: 'Sarah Smith (Carpenter)' }
                                ]}
                                placeholder="Assign Worker"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignConfirm} className="bg-blue-600 text-white">Confirm Assignment</Button>
                    </div>
                </div>
            </Modal>


            <div className="grid grid-cols-1 gap-4">
                {tasks.map(task => (
                    <Card key={task.id} className="group hover:border-blue-200 transition-all overflow-hidden border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">
                            {/* Icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-gray-100">
                                <CheckSquare className="h-6 w-6" />
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-extrabold text-gray-900">{task.name}</h3>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold bg-white">{task.category}</Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                        {task.pricingType === 'hourly' ? `${task.internalValue}/hr` : `${task.internalValue} Fixed`}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        {task.estimatedHours} hrs est.
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-8 border-l border-gray-100 pl-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
                                    <p className="text-xl font-black text-gray-900">{task.assignedInstances}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-green-100 text-green-600">
                                        <CheckSquare className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pl-4">
                                <Button
                                    onClick={() => openAssignModal(task)}
                                    className="bg-gray-900 text-white hover:bg-black shadow-sm h-10 px-4 gap-2 text-xs font-bold uppercase tracking-wide"
                                >
                                    Assign
                                    <ArrowRight className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(task.id)}
                                    className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
