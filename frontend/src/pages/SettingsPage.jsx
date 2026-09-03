import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn, initials, avatarColor } from '@/lib/utils';
import { User, Mail, Briefcase, Loader2, Check, Save } from 'lucide-react';

export function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await updateProfile({ name, jobTitle, avatarUrl });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert(error);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile and account preferences</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Profile</h2>
        <p className="text-sm text-slate-500 mb-6">Update your personal information</p>

        <div className="flex items-center gap-4 mb-6">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-2xl font-bold text-2xl text-white ring-4 ring-white shadow-lg',
              avatarColor(name || 'default'),
            )}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              initials(name || 'U')
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{name || 'Your Name'}</p>
            <p className="text-sm text-slate-500">{jobTitle || 'Add your job title'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Product Manager"
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Account</h2>
        <p className="text-sm text-slate-500 mb-4">Your account details</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Mail className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Session</h2>
        <p className="text-sm text-slate-500 mb-4">Sign out of your account</p>
        <Button variant="danger" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
