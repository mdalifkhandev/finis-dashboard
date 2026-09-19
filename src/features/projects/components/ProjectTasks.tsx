import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, CheckSquare, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Label } from '@/shared/components/ui/Label';
import { Select } from '@/shared/components/ui/Select';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { useTasks, useCreateTask, useAssignTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useProjectTeam, useProjectFloors } from '../hooks/useProjects';

export function ProjectTasks() {
    const { id: projectId } = useParams();
    const { data: tasks, isLoading } = useTasks(projectId ?? '');
    const { createTask, isCreating } = useCreateTask();
    const { assignTask, isAssigning } = useAssignTask();
    const { updateTask, isUpdating } = useUpdateTask();
    const { deleteTask, isDeleting } = useDeleteTask();
    
    // For assigning workers
    const { data: teamData } = useProjectTeam(projectId ?? '');
    const availableWorkers = teamData?.workers || [];
    const { data: floors } = useProjectFloors(projectId ?? '');

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<any>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

    // Form State for New Task Definition
    const [newTask, setNewTask] = useState<{
        title: string;
        description: string;
        estimatedHours: number;
        floorIds: string[];
        unitIds: string[];
    }>({
        title: '',
        description: '',
        estimatedHours: 0,
        floorIds: [],
        unitIds: []
    });

    const selectedFloors = floors?.filter((f: any) => newTask.floorIds.includes(f.id)) || [];
    const floorUnits = selectedFloors.flatMap((f: any) => f.rooms || f.units || []);

    const handleSaveTaskDef = async () => {
        if (!newTask.title || !projectId) return;
        try {
            const payload = {
                projectId,
                title: newTask.title,
                description: newTask.description,
                estimatedHours: newTask.estimatedHours,
                ...(newTask.floorIds.length ? { floorIds: newTask.floorIds } : {}),
                ...(newTask.unitIds.length ? { unitIds: newTask.unitIds } : {})
            };
            if (editTaskId) {
                await updateTask(editTaskId, payload);
            } else {
                await createTask(payload);
            }
            setIsAddModalOpen(false);
            setEditTaskId(null);
            setNewTask({ title: '', description: '', estimatedHours: 0, floorIds: [], unitIds: [] });
        } catch (err) {
            console.error('Error saving task', err);
        }
    };

    const openEditModal = (task: any) => {
        setNewTask({
            title: task.title,
            description: task.description || '',
            estimatedHours: task.estimatedHours || 0,
            floorIds: task.taskFloors?.map((tf: any) => tf.floor?.id).filter(Boolean) || [],
            unitIds: task.taskUnits?.map((tu: any) => tu.unit?.id).filter(Boolean) || []
        });
        setEditTaskId(task.id);
        setIsAddModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTaskId) return;
        try {
            await deleteTask(deleteTaskId);
            setIsDeleteModalOpen(false);
            setDeleteTaskId(null);
        } catch (err) {
            console.error('Error deleting task', err);
        }
    };

    const openAssignModal = (task: any) => {
        setSelectedTaskForAssignment(task);
        setIsAssignModalOpen(true);
    };

    const handleAssignConfirm = async () => {
        if (!selectedTaskForAssignment || !selectedWorkerId) return;
        try {
            await assignTask(selectedTaskForAssignment.id, { workerId: selectedWorkerId });
            setIsAssignModalOpen(false);
            setSelectedTaskForAssignment(null);
            setSelectedWorkerId('');
        } catch (err) {
            console.error('Error assigning task', err);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading tasks...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Project Tasks</h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight font-bold">Manage tasks and assignments</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    <Plus className="h-4 w-4" />
                    Create Task
                </Button>
            </div>

            {/* Task Definition Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditTaskId(null);
                    setNewTask({ title: '', description: '', estimatedHours: 0, floorIds: [], unitIds: [] });
                }}
                title={editTaskId ? "Edit Task" : "Create Task"}
                maxWidth="md"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Task Title</Label>
                            <Input
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="e.g. Install Kitchen Cabinets"
                                className="font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Task details..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Estimated Hours</Label>
                            <Input
                                type="number"
                                value={newTask.estimatedHours || ''}
                                onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                                placeholder="e.g. 4"
                            />
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label>Floors / Sections (Optional)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {floors?.map((f: any) => {
                                        const isSelected = newTask.floorIds.includes(f.id);
                                        return (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => {
                                                    setNewTask(prev => {
                                                        const newFloorIds = isSelected
                                                            ? prev.floorIds.filter(id => id !== f.id)
                                                            : [...prev.floorIds, f.id];
                                                        // Also remove unitIds that belong to the unselected floor
                                                        const validFloorIds = new Set(newFloorIds);
                                                        const validUnits = (floors || [])
                                                            .filter((fl: any) => validFloorIds.has(fl.id))
                                                            .flatMap((fl: any) => fl.rooms || fl.units || [])
                                                            .map((u: any) => u.id);
                                                        const validUnitSet = new Set(validUnits);
                                                        const newUnitIds = prev.unitIds.filter(uid => validUnitSet.has(uid));
                                                        
                                                        return { ...prev, floorIds: newFloorIds, unitIds: newUnitIds };
                                                    });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                    isSelected 
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/50'
                                                }`}
                                            >
                                                {f.name || 'Unnamed Floor'}
                                            </button>
                                        );
                                    })}
                                    {(!floors || floors.length === 0) && (
                                        <p className="text-xs text-gray-400">No floors available</p>
                                    )}
                                </div>
                            </div>
                            
                            {newTask.floorIds.length > 0 && floorUnits.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Units / Rooms (Optional)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {floorUnits.map((u: any) => {
                                            const isSelected = newTask.unitIds.includes(u.id);
                                            return (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setNewTask(prev => ({
                                                            ...prev,
                                                            unitIds: isSelected
                                                                ? prev.unitIds.filter(id => id !== u.id)
                                                                : [...prev.unitIds, u.id]
                                                        }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                        isSelected 
                                                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/50'
                                                    }`}
                                                >
                                                    {u.name || 'Unnamed Unit'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSaveTaskDef}
                            disabled={!newTask.title || isCreating || isUpdating}
                        >
                            {isCreating || isUpdating ? (editTaskId ? 'Saving...' : 'Creating...') : (editTaskId ? 'Save Changes' : 'Create Task')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Assign Task Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign Task"
                maxWidth="md"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Worker</Label>
                            <Select
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                options={[
                                    { value: '', label: 'Select a worker...' },
                                    ...(availableWorkers.map((w: any) => {
                                        const uid = w.userId || w.id || w.user?.id;
                                        return {
                                            value: uid,
                                            label: w.user?.fullName || w.fullName || 'Unknown'
                                        };
                                    }))
                                ]}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleAssignConfirm}
                            disabled={!selectedWorkerId || isAssigning}
                        >
                            {isAssigning ? 'Assigning...' : 'Assign Worker'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks?.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <CheckSquare className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">No tasks defined</h3>
                        <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">Create tasks to track progress across floors and units.</p>
                        <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="text-xs font-bold border-gray-200">
                            Create First Task
                        </Button>
                    </div>
                ) : (
                    tasks?.map((task: any) => (
                        <Card key={task.id} className="hover:border-blue-200 transition-all group overflow-hidden">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="uppercase text-[10px] font-bold tracking-wider">{task.status}</Badge>
                                        <Dropdown
                                            align="right"
                                            trigger={
                                                <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            }
                                            items={[
                                                { label: 'Edit Task', icon: Edit, onClick: () => openEditModal(task) },
                                                { label: 'Delete Task', icon: Trash2, variant: 'destructive', onClick: () => { setDeleteTaskId(task.id); setIsDeleteModalOpen(true); } }
                                            ]}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">{task.description || 'No description provided.'}</p>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            <Clock className="h-3 w-3" />
                                            Est. Hours
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">{task.estimatedHours || 0} hrs</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                                            <CheckSquare className="h-3 w-3" />
                                            Assignments
                                        </div>
                                        <div className="text-sm font-bold text-blue-900">{task.assignedWorkerCount || task.assignees?.length || 0} Workers</div>
                                    </div>
                                </div>
                                
                                {/* Show Locations */}
                                {(task.taskFloors?.length > 0 || task.taskUnits?.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {task.taskFloors?.map((tf: any) => (
                                            <Badge key={`f-${tf.floor?.id}`} variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 border-purple-100">
                                                {tf.floor?.name || 'Floor'}
                                            </Badge>
                                        ))}
                                        {task.taskUnits?.map((tu: any) => (
                                            <Badge key={`u-${tu.unit?.id}`} variant="secondary" className="text-[10px] bg-orange-50 text-orange-700 border-orange-100">
                                                {tu.unit?.name || 'Unit'}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs font-bold gap-2 border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                        onClick={() => openAssignModal(task)}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Assign Worker
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Task"
                maxWidth="sm"
            >
                <div className="space-y-6">
                    <p className="text-sm text-gray-600">Are you sure you want to delete this task? This action cannot be undone.</p>
                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
