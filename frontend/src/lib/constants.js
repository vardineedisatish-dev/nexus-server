export const TASK_STATUSES = [
  { value: 'backlog', label: 'Backlog', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { value: 'todo', label: 'To Do', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'review', label: 'In Review', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  { value: 'done', label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-500 bg-slate-50 border-slate-200' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200' },
];

export const PROJECT_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', ring: 'ring-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', ring: 'ring-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', ring: 'ring-rose-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', ring: 'ring-teal-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', ring: 'ring-pink-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', ring: 'ring-cyan-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', ring: 'ring-amber-500' },
];

export function getStatusConfig(status) {
  return TASK_STATUSES.find((s) => s.value === status) || TASK_STATUSES[1];
}

export function getPriorityConfig(priority) {
  return TASK_PRIORITIES.find((p) => p.value === priority) || TASK_PRIORITIES[1];
}

export function getColorConfig(color) {
  return PROJECT_COLORS.find((c) => c.value === color) || PROJECT_COLORS[0];
}
