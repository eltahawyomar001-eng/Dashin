'use client';

import { useState } from 'react';
import {
  Container,
  PageHeader,
  Button,
  Table,
  Badge,
  Dialog,
  useToast,
  EmptyState,
} from '@dashin/ui';
import { UserPlus, Trash2, Edit, Shield, Building2, User as UserIcon, Users } from 'lucide-react';
import { Can } from '@dashin/rbac';
import type { Column } from '@dashin/ui';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'agency_admin' | 'researcher' | 'client';
  agencyId: string | null;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

export default function UsersPage() {
  const { showToast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Mock data - will be replaced with Supabase query
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@dashin.com',
      role: 'super_admin',
      agencyId: null,
      createdAt: '2026-01-15T10:00:00Z',
      status: 'active',
    },
    {
      id: '2',
      email: 'agency@example.com',
      role: 'agency_admin',
      agencyId: 'agency-1',
      createdAt: '2026-01-20T14:30:00Z',
      status: 'active',
    },
    {
      id: '3',
      email: 'researcher@example.com',
      role: 'researcher',
      agencyId: 'agency-1',
      createdAt: '2026-01-25T09:15:00Z',
      status: 'active',
    },
  ];

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4 text-accent-400" />;
      case 'agency_admin':
        return <Building2 className="h-4 w-4 text-primary-400" />;
      case 'researcher':
        return <UserIcon className="h-4 w-4 text-blue-400" />;
      case 'client':
        return <Users className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleLabel = (role: User['role']) => {
    return role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'success' as const;
      case 'inactive':
        return 'default' as const;
      case 'suspended':
        return 'danger' as const;
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    // TODO: Implement actual delete logic with Supabase
    showToast({
      type: 'success',
      title: 'User Deleted',
      message: `${userToDelete.email} has been removed.`,
    });

    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;

    // TODO: Implement bulk delete
    showToast({
      type: 'success',
      title: 'Users Deleted',
      message: `${selectedUsers.size} user(s) have been removed.`,
    });

    setSelectedUsers(new Set());
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="glass-strong h-10 w-10 rounded-lg flex items-center justify-center">
            {getRoleIcon(user.role)}
          </div>
          <div>
            <p className="font-medium text-white">{user.email}</p>
            <p className="text-xs text-slate-400">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-slate-300">{getRoleLabel(user.role)}</span>
      ),
    },
    {
      key: 'agencyId',
      header: 'Agency',
      render: (user) => (
        <span className="text-sm text-slate-400">
          {user.agencyId || <span className="italic">No agency</span>}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <Badge variant={getStatusVariant(user.status)}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-slate-400">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Can permission="user:update">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Edit User',
                  message: 'Edit functionality will be added in next iteration',
                });
              }}
            >
              Edit
            </Button>
          </Can>
          <Can permission="user:delete">
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                setUserToDelete(user);
                setDeleteDialogOpen(true);
              }}
            >
              Delete
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <Container size="lg">
        <PageHeader
          title="Users"
          description="Manage user accounts and permissions"
          actions={
            <Can permission="user:create">
              <Button
                variant="primary"
                leftIcon={<UserPlus className="h-5 w-5" />}
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Create User',
                    message: 'User creation form will be added in next iteration',
                  });
                }}
              >
                Add User
              </Button>
            </Can>
          }
        />

        {selectedUsers.size > 0 && (
          <div className="mb-6 glass-strong rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-slate-300">
              {selectedUsers.size} user(s) selected
            </span>
            <Can permission="user:delete">
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </Can>
          </div>
        )}

        <Can
          permission="user:view"
          fallback={
            <EmptyState
              icon={<Shield className="h-12 w-12" />}
              title="Access Denied"
              description="You don't have permission to view users."
            />
          }
        >
          <Table
            columns={columns}
            data={mockUsers}
            keyExtractor={(user) => user.id}
            selectable
            selectedRows={selectedUsers}
            onSelectionChange={setSelectedUsers}
            pagination={{
              page,
              pageSize,
              total: mockUsers.length,
              onPageChange: setPage,
            }}
            emptyState={
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="No Users Found"
                description="Get started by creating your first user account."
                action={
                  <Can permission="user:create">
                    <Button
                      variant="primary"
                      leftIcon={<UserPlus className="h-5 w-5" />}
                      onClick={() => {
                        showToast({
                          type: 'info',
                          title: 'Create User',
                          message: 'User creation form will be added in next iteration',
                        });
                      }}
                    >
                      Add User
                    </Button>
                  </Can>
                }
              />
            }
          />
        </Can>

        {/* Delete Confirmation Dialog */}
        <Dialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete User"
          description={`Are you sure you want to delete ${userToDelete?.email}? This action cannot be undone.`}
          variant="danger"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
        />
      </Container>
  );
}
