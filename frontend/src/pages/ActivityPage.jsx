import { useState } from 'react';
import { useProjects, useActivityLogs } from '@/hooks/useData';
import { getColorConfig } from '@/lib/constants';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import {
  FolderKanban,
  Activity as ActivityIcon,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  FilePlus,
  Edit3,
  UserCheck,
} from 'lucide-react';

const actionConfig = {
  task_created: { icon: FilePlus, color: 'bg-blue-50 text-blue-600', verb: 'created a task' },
  task_updated: { icon: Edit3, color: 'bg-amber-50 text-amber-600', verb: 'updated a task' },
  task_completed: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', verb: 'completed a task' },
  task_assigned: { icon: UserCheck, color: 'bg-teal-50 text-teal-600', verb: 'was assigned a task' },
  comment_added: { icon: MessageSquare, color: 'bg-slate-100 text-slate-600', verb: 'commented on a task' },
  project_created: { icon: FolderKanban, color: 'bg-violet-50 text-violet-600', verb: 'created a project' },
  member_added: { icon: UserPlus, color: 'bg-pink-50 text-pink-600', verb: 'added a team member' },
};

export function ActivityPage() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? null);
  const { activity, loading } = useActivityLogs(selectedProjectId, 50);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Feed</h1>
        <p className="mt-1 text-sm text-slate-500">Track all actions across your projects</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => {
            const pc = getColorConfig(p.color);
            const active = selectedProjectId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                  active
                    ? cn('bg-white shadow-sm', pc.border, pc.text)
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white',
                )}
              >
                <FolderKanban className={cn('h-4 w-4', active ? pc.text : 'text-slate-400')} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        </div>
      ) : activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <ActivityIcon className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">No activity yet</h3>
          <p className="mt-1 text-sm text-slate-500">Actions in this project will appear here</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-1">
            {activity.map((log, idx) => {
              const cfg = actionConfig[log.action] || actionConfig.task_updated;
              const isSameDay =
                idx > 0 &&
                new Date(activity[idx - 1].createdAt).toDateString() === new Date(log.createdAt).toDateString();

              return (
                <div key={log.id}>
                  {!isSameDay && (
                    <div className="relative flex items-center gap-4 py-4">
                      <div className="ml-[11px] text-xs font-semibold uppercase tracking-wide text-slate-400 bg-slate-50 px-2 rounded">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  )}
                  <div className="relative flex items-start gap-4 py-3 group">
                    <div className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-slate-50', cfg.color)}>
                      <cfg.icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={log.user?.name || 'User'} src={log.user?.avatarUrl} size="xs" />
                        <p className="text-sm text-slate-700">
                          <span className="font-medium text-slate-900">{log.user?.name || 'Someone'}</span>{' '}
                          {cfg.verb}
                        </p>
                      </div>
                      {log.metadata?.title && (
                        <p className="text-sm text-slate-500 mt-1 ml-7">{log.metadata.title}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5 ml-7">{formatRelativeTime(log.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
