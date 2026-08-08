import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Building2,
  Save,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { selectAuthUser } from '@/store/authSlice';
import { updateAuthUser } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { config } from '@/config/env';
import { useChangePasswordMutation, useGetMyProfileQuery, useUpdateMyProfileMutation } from '@/store/settingsApi';

export function SettingsPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authUser = useSelector(selectAuthUser);
  const settings = useSelector((state: RootState) => state.settings);

  const { data: profile, isLoading: profileLoading, refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateMyProfileMutation();
  const [changePassword, { isLoading: isSavingPassword }] = useChangePasswordMutation();

  const [activeTab, setActiveTab] = useState('profile');
  const [activeTabQuery] = useState((location.state as { activeTab?: string } | null)?.activeTab ?? 'profile');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileName, setAvatarFileName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setPhone(profile.phone ?? '');
      setEmail(profile.email ?? '');
      setBio(profile.bio ?? '');
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '');
    } else if (authUser) {
      setFullName(authUser.fullName ?? '');
      setPhone(authUser.phone ?? '');
      setEmail(authUser.email ?? '');
    }
  }, [profile, authUser]);

  useEffect(() => {
    if (activeTabQuery && ['profile', 'account', 'security'].includes(activeTabQuery)) setActiveTab(activeTabQuery);
  }, [activeTabQuery]);

  const avatarText = useMemo(() => {
    const source = fullName || authUser?.fullName || 'User';
    return source.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }, [authUser?.fullName, fullName]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarFileName(file.name);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const resolveAvatarUrl = (value?: string | null) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `${config.apiBaseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
  };

  const handleProfileSave = async () => {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('bio', bio);
    if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
    if (avatarFile) formData.append('avatar', avatarFile);
    const updated = await updateProfile(formData).unwrap();
    dispatch(updateAuthUser({
      fullName: updated.fullName,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
    }));
    setAvatarFile(null);
    setAvatarFileName('');
    if (updated.avatarUrl) setAvatarPreview(resolveAvatarUrl(updated.avatarUrl));
    refetch();
  };

  const handlePasswordSave = async () => {
    await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Settings"
        description="Your account settings plus public pages editor."
        icon={Settings}
      />

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
          { id: 'account', label: 'Account', icon: <Building2 className="h-4 w-4" /> },
          { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
        ]}
      />

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your photo and personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Selected preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <AvatarImage src={resolveAvatarUrl(profile?.avatarUrl || authUser?.avatarUrl)} />
                )}
                <AvatarFallback>{avatarText || 'U'}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('profile-avatar-input')?.click()}>
                  Change Photo
                </Button>
                <input id="profile-avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-gray-500">JPG, PNG or GIF. Local preview only.</p>
                {avatarFileName && <p className="text-xs text-gray-400">Selected: {avatarFileName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Full Name</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Email Address</label><Input value={email} type="email" disabled className="bg-gray-50" /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Phone Number</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Date of Birth</label><Input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" /></div>
              <div className="col-span-full space-y-2"><label className="text-sm font-medium text-gray-700">Bio</label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write a short bio" /></div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleProfileSave} disabled={profileLoading || isSavingProfile} className="gap-2"><Save className="h-4 w-4" />{isSavingProfile ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'account' && (
        <Card>
          <CardHeader><CardTitle>Account Information</CardTitle><CardDescription>Details about your organization and role.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Company Name</label><Input value="Finis Ltd." disabled className="bg-gray-50" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Your Role</label><Input value={profile?.role ?? authUser?.role ?? 'Admin'} disabled className="bg-gray-50" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Department</label><Input value={profile?.department ?? 'Management'} disabled className="bg-gray-50" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Employee ID</label><Input value={profile?.employeeId ?? 'N/A'} disabled className="bg-gray-50" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Status</label><Input value={profile?.status ?? authUser?.role ?? 'active'} disabled className="bg-gray-50" /></div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader><CardTitle>Password & Authentication</CardTitle><CardDescription>Manage your login security preferences.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Current Password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">New Password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" /></div>
            </div>
            <div className="pt-2"><Button variant="outline" onClick={handlePasswordSave} disabled={isSavingPassword}>{isSavingPassword ? 'Updating...' : 'Update Password'}</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
