import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects, useTasks, useProjectMembers } from '@/hooks/useData';
import { api } from '@/lib/api';
import { getColorConfig, PROJECT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import {
  FolderKanban,
  Plus,
  Search,
  ArrowRight,
  Users,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

export function ProjectsPage({ onOpenProject }) {
  const { user } = useAuth();
  const { projects, loading, refetch } = useProjects();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and organize your team's work</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FolderKanban className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            {search ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 mb-4">
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          {!search && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={project.owner?.id === user?.id || project.owner === user?.id}
              onOpen={() => onOpenProject(project.id)}
              onEdit={() => setEditProject(project.id)}
              onRefetch={refetch}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <ProjectFormModal
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}

      {editProject && (
        <ProjectFormModal
          projectId={editProject}
          onClose={() => setEditProject(null)}
          onSaved={() => {
            setEditProject(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, isOwner, onOpen, onEdit, onRefetch }) {
  const { tasks } = useTasks(project.id);
  const { members } = useProjectMembers(project.id);
  const color = getColorConfig(project.color);
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${project.id}`);
      onRefetch();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-lg">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', color.bg)}>
            <FolderKanban className={cn('h-6 w-6', color.text)} />
          </div>
          <div className="flex items-center gap-1 text-slate-300 group-hover:text-slate-400 transition-colors">
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem]">
          {project.description || 'No description'}
        </p>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500">{doneCount} of {tasks.length} tasks done</span>
            <span className="font-medium text-slate-700">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full transition-all duration-500', color.class)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((m) => (
              <Avatar key={m.id} name={m.user?.name || 'User'} src={m.user?.avatarUrl} size="xs" />
            ))}
            {members.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-semibold text-slate-500">
                +{members.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="h-3 w-3" />
            {members.length}
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectFormModal({ projectId, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (projectId) {
      api
        .get(`/projects/${projectId}`)
        .then((data) => {
          const p = data.project;
          if (p) {
            setName(p.name);
            setDescription(p.description || '');
            setColor(p.color || 'blue');
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [projectId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      if (projectId) {
        await api.patch(`/projects/${projectId}`, { name, description, color });
      } else {
        await api.post('/projects', { name, description, color });
      }
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Modal open onClose={onClose}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {projectId ? 'Edit Project' : 'Create Project'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {projectId ? 'Update your project details' : 'Set up a new workspace for your team'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website Redesign"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief description of the project goals..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'h-8 w-8 rounded-lg transition-all',
                    c.class,
                    color === c.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : projectId ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
