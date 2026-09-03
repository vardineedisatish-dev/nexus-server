import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects, useTasks, useTaskCounts, useActivityLogs } from '@/hooks/useData';
import { getColorConfig, getStatusConfig } from '@/lib/constants';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity as ActivityIcon,
  Plus,
} from 'lucide-react';

export function Dashboard({ onNavigate, onOpenProject }) {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { counts } = useTaskCounts();

  const firstProjectId = projects[0]?.id ?? null;
  const { tasks } = useTasks(firstProjectId);
  const { activity } = useActivityLogs(firstProjectId, 8);

  const totalTasks = Object.values(counts).reduce((a, b) => a + b, 0);
  const completionRate = totalTasks > 0 ? Math.round((counts.done / totalTasks) * 100) : 0;

  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => t.assignee?._id === user.id || t.assignee?.id === user.id).slice(0, 5);
  }, [tasks, user]);

  const stats = [
    { label: 'Active Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-600 bg-blue-50', onClick: () => onNavigate('projects') },
    { label: 'Tasks Completed', value: counts.done, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', onClick: () => onNavigate('projects') },
    { label: 'In Progress', value: counts.in_progress, icon: Clock, color: 'text-amber-600 bg-amber-50', onClick: () => onNavigate('projects') },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-teal-600 bg-teal-50', onClick: () => onNavigate('projects') },
  ];

  const statusBars = [
    { status: 'backlog', count: counts.backlog },
    { status: 'todo', count: counts.todo },
    { status: 'in_progress', count: counts.in_progress },
    { status: 'review', count: counts.review },
    { status: 'done', count: counts.done },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening across your workspace today.</p>
        </div>
        <Button onClick={() => onNavigate('projects')} className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Task Distribution</h2>
              <p className="text-sm text-slate-500">Breakdown by status across all projects</p>
            </div>
          </div>

          {totalTasks === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No tasks yet. Create a project to get started.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  {statusBars.map((bar) => {
                    if (bar.count === 0) return null;
                    const config = getStatusConfig(bar.status);
                    return (
                      <div
                        key={bar.status}
                        className={cn('h-full transition-all duration-500', config.dot)}
                        style={{ width: `${(bar.count / totalTasks) * 100}%` }}
                        title={`${config.label}: ${bar.count}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {statusBars.map((bar) => {
                  const config = getStatusConfig(bar.status);
                  const pct = totalTasks > 0 ? Math.round((bar.count / totalTasks) * 100) : 0;
                  return (
                    <div key={bar.status} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className={cn('h-2 w-2 rounded-full', config.dot)} />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{bar.count}</p>
                      <p className="text-xs text-slate-500">{config.label}</p>
                      <p className="text-xs text-slate-400">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <ActivityIcon className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>

          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activity.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <Avatar name={log.user?.name || 'User'} src={log.user?.avatarUrl} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        {log.user?.name || 'Someone'}
                      </span>{' '}
                      {formatActionText(log.action)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </button>
          </div>

          {projectsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderKanban className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 mb-3">No projects yet</p>
              <Button size="sm" onClick={() => onNavigate('projects')}>
                <Plus className="h-4 w-4" />
                Create your first project
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 4).map((project) => {
                const color = getColorConfig(project.color);
                return (
                  <button
                    key={project.id}
                    onClick={() => onOpenProject(project.id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color.bg)}>
                      <FolderKanban className={cn('h-5 w-5', color.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{project.name}</p>
                      <p className="truncate text-xs text-slate-500">{project.description || 'No description'}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">My Tasks</h2>
          </div>

          {myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => {
                const config = getStatusConfig(task.status);
                return (
                  <button
                    key={task.id}
                    onClick={() => task.project && onOpenProject(task.project)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
                  >
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', config.dot)} />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                      {task.title}
                    </p>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.color)}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatActionText(action) {
  const map = {
    task_created: 'created a task',
    task_updated: 'updated a task',
    task_completed: 'completed a task',
    task_assigned: 'was assigned a task',
    comment_added: 'commented on a task',
    project_created: 'created a project',
    member_added: 'added a team member',
  };
  return map[action] || action;
}
