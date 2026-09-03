import { useState } from 'react';
import { useProjects, useProjectMembers, useAllUsers } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getColorConfig } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FolderKanban, Plus, UserPlus, Search, X, Crown, Mail } from 'lucide-react';

export function TeamPage() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { users } = useAllUsers();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? null);
  const { members, refetch } = useProjectMembers(selectedProjectId);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const isOwner = (currentProject?.owner?._id || currentProject?.owner?.id) === user?.id;
  const color = getColorConfig(currentProject?.color || 'blue');

  const availableUsers = users.filter(
    (p) =>
      !members.some((m) => (m.user?._id || m.user?.id) === p.id) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)),
  );

  async function addMember(userId) {
    if (!selectedProjectId) return;
    try {
      await api.post(`/projects/${selectedProjectId}/members`, { userId });
      refetch();
      setShowAdd(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeMember(userId) {
    if (!selectedProjectId) return;
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${selectedProjectId}/members/${userId}`);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team</h1>
        <p className="mt-1 text-sm text-slate-500">Manage members and collaboration across your projects</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Project</label>
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
          {projects.length === 0 && (
            <p className="text-sm text-slate-500">Create a project first to manage team members.</p>
          )}
        </div>
      </div>

      {selectedProjectId && currentProject && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color.bg)}>
                  <FolderKanban className={cn('h-5 w-5', color.text)} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{currentProject.name}</h2>
                  <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {isOwner && (
                <Button onClick={() => setShowAdd(true)} size="sm">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                  <Avatar name={m.user?.name || 'User'} src={m.user?.avatarUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{m.user?.name}</p>
                      {m.role === 'owner' && (
                        <Badge variant="warning">
                          <Crown className="h-3 w-3" />
                          Owner
                        </Badge>
                      )}
                      {(m.user?._id || m.user?.id) === user?.id && <Badge variant="info">You</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{m.user?.jobTitle || 'Team Member'}</p>
                  </div>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Joined {formatDate(m.joinedAt)}
                  </p>
                  {isOwner && m.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(m.user?._id || m.user?.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-sm text-slate-500">No members in this project yet.</p>
                </div>
              )}
            </div>
          </div>

          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
              <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Add Team Member</h2>
                  <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {availableUsers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addMember(p.id)}
                      className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <Avatar name={p.name} src={p.avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="truncate text-xs text-slate-500">{p.jobTitle || 'Team Member'}</p>
                      </div>
                      <Plus className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="py-8 text-center">
                      <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        {search ? 'No users found' : 'All users are already members'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
