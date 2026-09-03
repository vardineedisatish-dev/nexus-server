import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, useProjectMembers, useTaskComments } from '@/hooks/useData';
import { api } from '@/lib/api';
import { TASK_STATUSES, TASK_PRIORITIES, getStatusConfig, getPriorityConfig, getColorConfig } from '@/lib/constants';
import { cn, formatRelativeTime, formatDate, dueDateColor, isOverdue } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  MessageCircle,
  Calendar,
  Flag,
  GripVertical,
  ArrowLeft,
  Trash2,
  Pencil,
  Send,
  Loader2,
  Users,
} from 'lucide-react';

export function BoardPage({ projectId, onBack }) {
  const { user } = useAuth();
  const { tasks, loading, refetch } = useTasks(projectId);
  const { members } = useProjectMembers(projectId);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [creatingInColumn, setCreatingInColumn] = useState(null);

  const columns = TASK_STATUSES;

  const tasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status),
    [tasks],
  );

  async function moveTask(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    try {
      await api.patch(`/tasks/${projectId}/${taskId}`, { status: newStatus });
      refetch();
    } catch (err) {
      console.error(err);
    }
  }

  async function createTask(title, status) {
    if (!title.trim()) return;
    try {
      await api.post(`/tasks/${projectId}`, { title: title.trim(), status });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleDragStart(e, taskId) {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }

  function handleDrop(e, status) {
    e.preventDefault();
    if (draggedTask) moveTask(draggedTask, status);
    setDraggedTask(null);
    setDragOverColumn(null);
  }

  function handleDragEnd() {
    setDraggedTask(null);
    setDragOverColumn(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BoardHeader projectId={projectId} onBack={onBack} members={members} />

      <div className="flex-1 overflow-x-auto px-4 lg:px-6 pb-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((col) => {
            const colTasks = tasksByStatus(col.value);
            return (
              <div
                key={col.value}
                className={cn(
                  'flex w-72 shrink-0 flex-col rounded-2xl bg-slate-100/60 transition-colors',
                  dragOverColumn === col.value && 'bg-slate-200/80 ring-2 ring-slate-300',
                )}
                onDragOver={(e) => handleDragOver(e, col.value)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDrop(e, col.value)}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', col.dot)} />
                    <span className="font-semibold text-sm text-slate-700">{col.label}</span>
                    <span className="text-xs font-medium text-slate-400 bg-white rounded-full px-2 py-0.5">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setCreatingInColumn(col.value)}
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedTask === task.id}
                    />
                  ))}

                  {creatingInColumn === col.value && (
                    <QuickAddTask
                      onAdd={(title) => {
                        createTask(title, col.value);
                        setCreatingInColumn(null);
                      }}
                      onCancel={() => setCreatingInColumn(null)}
                    />
                  )}

                  {colTasks.length === 0 && creatingInColumn !== col.value && (
                    <button
                      onClick={() => setCreatingInColumn(col.value)}
                      className="w-full rounded-xl border-2 border-dashed border-slate-200 py-6 text-xs text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-500"
                    >
                      <Plus className="h-4 w-4 mx-auto mb-1" />
                      Add task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setSelectedTask(updated);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function BoardHeader({ projectId, onBack, members }) {
  const [project, setProject] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    api
      .get(`/projects/${projectId}`)
      .then((data) => setProject(data.project))
      .catch(() => {});
  }, [projectId]);

  const color = getColorConfig(project?.color || 'blue');

  return (
    <div className="border-b border-slate-200 bg-white px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', color.bg)}>
            <span className={cn('text-sm font-bold', color.text)}>
              {project?.name?.charAt(0).toUpperCase() || 'P'}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">{project?.name || 'Loading...'}</h1>
            <p className="text-xs text-slate-500 truncate">{project?.description || 'No description'}</p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-slate-50"
          >
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((m) => (
                <Avatar key={m.id} name={m.user?.name || 'User'} src={m.user?.avatarUrl} size="xs" />
              ))}
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">{members.length} members</span>
          </button>

          {showMembers && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMembers(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg z-20 p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">Team Members</p>
                <div className="space-y-1">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
                      <Avatar name={m.user?.name || 'User'} src={m.user?.avatarUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{m.user?.name}</p>
                        <p className="truncate text-xs text-slate-500">{m.user?.jobTitle || 'Team Member'}</p>
                      </div>
                      {m.role === 'owner' && <Badge variant="info">Owner</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick, onDragStart, onDragEnd, isDragging }) {
  const priority = getPriorityConfig(task.priority);
  const dueColor = dueDateColor(task.dueDate);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-md',
        'active:cursor-grabbing',
        isDragging && 'opacity-50 rotate-2',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-900 leading-snug">{task.title}</p>
        <GripVertical className="h-4 w-4 text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium', priority.color)}>
            <Flag className="h-2.5 w-2.5" />
            {priority.label}
          </span>
          {task.dueDate && (
            <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', dueColor)}>
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {task.assignee ? (
          <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="xs" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Users className="h-3 w-3 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAddTask({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white p-3">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAdd(title);
          }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Task title..."
        rows={2}
        className="w-full text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <Button size="sm" onClick={() => onAdd(title)} disabled={!title.trim()}>
          Add
        </Button>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-700">
          Cancel
        </button>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, projectId, members, onClose, onUpdate }) {
  const { user } = useAuth();
  const { comments, refetch: refetchComments } = useTaskComments(task.id);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee?._id || task.assignee?.id || null);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentPosting, setCommentPosting] = useState(false);

  async function saveChanges() {
    setSaving(true);
    try {
      const data = await api.patch(`/tasks/${projectId}/${task.id}`, {
        title,
        description,
        status,
        priority,
        assignee: assigneeId || null,
        dueDate: dueDate || null,
      });
      onUpdate(data.task);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  }

  async function addComment() {
    if (!newComment.trim()) return;
    setCommentPosting(true);
    try {
      await api.post(`/comments/${task.id}`, { content: newComment.trim() });
      refetchComments();
      setNewComment('');
    } catch (err) {
      alert(err.message);
    }
    setCommentPosting(false);
  }

  async function deleteTask() {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${projectId}/${task.id}`);
      onClose();
    } catch (err) {
      alert(err.message);
    }
  }

  const statusCfg = getStatusConfig(status);
  const priorityCfg = getPriorityConfig(priority);
  const assignedMember = members.find((m) => (m.user?._id || m.user?.id) === assigneeId);

  return (
    <Modal open onClose={onClose} className="max-w-2xl">
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="border-b border-slate-100 p-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium', statusCfg.color)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium', priorityCfg.color)}>
              <Flag className="h-3 w-3" />
              {priorityCfg.label}
            </span>
          </div>

          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-slate-900 border-b-2 border-slate-200 focus:border-slate-900 outline-none pb-1"
            />
          ) : (
            <h2 className="text-xl font-bold text-slate-900 pr-8">{task.title}</h2>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</label>
            {editing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {task.description || <span className="text-slate-400 italic">No description provided</span>}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status</label>
              {editing ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className={cn('h-2.5 w-2.5 rounded-full', statusCfg.dot)} />
                  {statusCfg.label}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Priority</label>
              {editing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Flag className="h-3.5 w-3.5" />
                  {priorityCfg.label}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Assignee</label>
              {editing ? (
                <select
                  value={assigneeId || ''}
                  onChange={(e) => setAssigneeId(e.target.value || null)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user?._id || m.user?.id} value={m.user?._id || m.user?.id}>
                      {m.user?.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  {assignedMember ? (
                    <>
                      <Avatar name={assignedMember.user?.name || 'User'} src={assignedMember.user?.avatarUrl} size="xs" />
                      <span className="text-sm text-slate-700">{assignedMember.user?.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Unassigned</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Due Date</label>
              {editing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              ) : (
                <div className={cn('flex items-center gap-2 text-sm', dueDateColor(task.dueDate))}>
                  <Calendar className="h-3.5 w-3.5" />
                  {task.dueDate ? formatDate(task.dueDate) : <span className="text-slate-400 italic">Not set</span>}
                  {isOverdue(task.dueDate) && <Badge variant="danger">Overdue</Badge>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
            {task.createdBy && <Avatar name={task.createdBy.name} src={task.createdBy.avatarUrl} size="xs" />}
            <span>Created by {task.createdBy?.name || 'Unknown'} · {formatRelativeTime(task.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={deleteTask}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            {editing ? (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={saveChanges} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Comments ({comments.length})</h3>
            </div>

            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar name={comment.user?.name || 'User'} src={comment.user?.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-slate-900">{comment.user?.name}</span>
                      <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-4">No comments yet</p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Avatar name={user?.name || 'You'} src={user?.avatarUrl} size="sm" />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      addComment();
                    }
                  }}
                  placeholder="Write a comment... (Cmd+Enter to post)"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
                {newComment.trim() && (
                  <Button size="sm" onClick={addComment} disabled={commentPosting} className="mt-2">
                    {commentPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Post Comment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
