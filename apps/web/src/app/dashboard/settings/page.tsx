'use client';

import { useState } from 'react';
import {
  Container,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Checkbox,
  useToast,
} from '@dashin/ui';
import { Save, Key, Bell, Palette } from 'lucide-react';
import { useUser } from '@dashin/auth';

export default function SettingsPage() {
  const user = useUser();
  const { showToast } = useToast();
  
  // Profile settings
  const [email, setEmail] = useState(user?.email || '');
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [leadUpdates, setLeadUpdates] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement profile update with Supabase
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
      });
      return;
    }
    
    if (newPassword.length < 8) {
      showToast({
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }
    
    // TODO: Implement password change with Supabase
    showToast({
      type: 'success',
      title: 'Password Changed',
      message: 'Your password has been updated successfully.',
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNotificationUpdate = () => {
    // TODO: Implement notification preferences update with Supabase
    showToast({
      type: 'success',
      title: 'Preferences Updated',
      message: 'Your notification preferences have been saved.',
    });
  };

  return (
    <Container>
      <PageHeader
          title="Settings"
          description="Manage your account settings and preferences"
        />

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="glass-strong h-10 w-10 rounded-xl flex items-center justify-center">
                  <Save className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Update your account information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-slate-400 -mt-2">Your email is used for login and notifications</p>
                
                <div className="glass-subtle rounded-lg p-4">
                  <p className="text-sm text-slate-400">Role</p>
                  <p className="text-sm font-medium text-white capitalize">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
                
                {user?.agencyId && (
                  <div className="glass-subtle rounded-lg p-4">
                    <p className="text-sm text-slate-400">Agency ID</p>
                    <p className="text-sm font-mono text-white">{user.agencyId}</p>
                  </div>
                )}
                
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" leftIcon={<Save className="h-4 w-4" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="glass-strong h-10 w-10 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Update your password to keep your account secure</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-400 -mt-2">Must be at least 8 characters long</p>
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" leftIcon={<Key className="h-4 w-4" />}>
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="glass-strong h-10 w-10 rounded-xl flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Choose what notifications you want to receive</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Checkbox
                label="Enable email notifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
              
              <div className="pl-8 space-y-4 border-l-2 border-white/10">
                <Checkbox
                  label="Lead updates and status changes"
                  checked={leadUpdates}
                  onChange={(e) => setLeadUpdates(e.target.checked)}
                  disabled={!emailNotifications}
                />
                
                <Checkbox
                  label="Campaign alerts and milestones"
                  checked={campaignAlerts}
                  onChange={(e) => setCampaignAlerts(e.target.checked)}
                  disabled={!emailNotifications}
                />
                
                <Checkbox
                  label="Weekly summary reports"
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
                  disabled={!emailNotifications}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  leftIcon={<Bell className="h-4 w-4" />}
                  onClick={handleNotificationUpdate}
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preferences */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="glass-strong h-10 w-10 rounded-xl flex items-center justify-center">
                  <Palette className="h-5 w-5 text-accent-400" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Customize your experience</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="glass-subtle rounded-lg p-6 text-center">
                <Palette className="h-12 w-12 mx-auto text-slate-500 mb-3" />
                <p className="text-sm text-slate-400">
                  Theme customization will be available in a future update.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Currently using Glassmorphism Dark theme
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
  );
}
