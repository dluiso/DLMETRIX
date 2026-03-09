'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { User, KeyRound, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations('auth');
  const { user, fetchMe } = useAuthStore();

  const [name, setName]               = useState(user?.name || '');
  const [locale, setLocale]           = useState(user?.locale || 'en');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [savingPw, setSavingPw]       = useState(false);
  const [pwError, setPwError]         = useState('');
  const [pwSuccess, setPwSuccess]     = useState('');

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch('/users/me', { name, locale });
      await fetchMe();
    } finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await api.patch('/users/me/password', { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess('Password changed successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      setPwError(err.data?.message || 'Password change failed');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

          {/* Profile info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <User className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2.5 rounded-lg border bg-gray-100 dark:bg-gray-800 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select
                  value={locale}
                  onChange={e => setLocale(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Change password */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <KeyRound className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold">Change Password</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Current Password', value: currentPw, set: setCurrentPw },
                { label: 'New Password',     value: newPw,     set: setNewPw     },
                { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={value}
                    onChange={e => set(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}

              {pwError   && <p className="text-red-500 text-sm">{pwError}</p>}
              {pwSuccess && <p className="text-green-600 text-sm">{pwSuccess}</p>}

              <Button onClick={changePassword} disabled={savingPw} variant="outline">
                {savingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
