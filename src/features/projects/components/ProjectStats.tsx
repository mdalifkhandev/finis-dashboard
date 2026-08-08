import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatCard } from '@/features/dashboard/components/StatCard';
import type { Project } from '@/shared/types';

interface ProjectStatsProps {
  projects: Project[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  // Calculate stats based on filtered projects
  const totalProjects = projects.length;
  const active = projects.filter(p => p.status === 'active').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const delayed = projects.filter(p => p.status === 'delayed' as any).length;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Projects"
        value={totalProjects.toString()}
        trend={8.3}
        icon={ClipboardList}
        color="text-primary"
        bgGradient="bg-gradient-to-br from-blue-50 to-transparent"
        isCount={true}
      />
      <StatCard
        title="Active"
        value={active.toString()}
        trend={33.3}
        icon={Clock}
        color="text-orange-500"
        bgGradient="bg-gradient-to-br from-orange-50 to-transparent"
        isCount={true}
      />
      <StatCard
        title="Completed"
        value={completed.toString()}
        trend={12.5}
        icon={CheckCircle2}
        color="text-green-500"
        bgGradient="bg-gradient-to-br from-green-50 to-transparent"
        isCount={true}
      />
      <StatCard
        title="Delayed"
        value={delayed.toString()}
        trend={-20.0}
        icon={AlertCircle}
        color="text-red-500"
        bgGradient="bg-gradient-to-br from-red-50 to-transparent"
        isCount={true}
      />
    </div>
  );
}