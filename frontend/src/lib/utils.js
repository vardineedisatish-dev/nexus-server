export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function formatDate(date) {
  if (!date) return 'No due date';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffSec = Math.floor((now - past) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return formatDate(date);
}

export function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date(new Date().toDateString());
}

export function dueDateColor(date) {
  if (!date) return 'text-slate-400';
  const d = new Date(date);
  const now = new Date(new Date().toDateString());
  const diffDay = Math.floor((d - now) / 86400000);
  if (isOverdue(date)) return 'text-red-600';
  if (diffDay <= 1) return 'text-amber-600';
  if (diffDay <= 3) return 'text-blue-600';
  return 'text-slate-500';
}

export function avatarColor(seed) {
  const colors = [
    'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-red-500',
    'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}
