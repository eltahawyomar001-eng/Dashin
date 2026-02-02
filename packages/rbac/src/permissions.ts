import type { UserRole } from '@dashin/shared-types';

// Define permissions for each resource action
export type Permission =
  // Agency permissions
  | 'agency:view'
  | 'agency:create'
  | 'agency:update'
  | 'agency:delete'
  // User permissions
  | 'user:view'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  // Client permissions
  | 'client:view'
  | 'client:create'
  | 'client:update'
  | 'client:delete'
  // Campaign permissions
  | 'campaign:view'
  | 'campaign:create'
  | 'campaign:update'
  | 'campaign:delete'
  // Lead permissions
  | 'lead:view'
  | 'lead:create'
  | 'lead:update'
  | 'lead:delete'
  | 'lead:approve'
  | 'lead:reject'
  // Scraping permissions
  | 'scrape:view'
  | 'scrape:create'
  | 'scrape:delete'
  // Cleanroom permissions
  | 'cleanroom:view'
  | 'cleanroom:create'
  | 'cleanroom:execute'
  // Research IQ permissions
  | 'research_iq:view_own'
  | 'research_iq:view_all'
  // Cost permissions
  | 'cost:view'
  | 'cost:export'
  // Time log permissions
  | 'time_log:view_own'
  | 'time_log:view_all'
  | 'time_log:create'
  | 'time_log:update'
  | 'time_log:delete';

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Full system access
    'agency:view',
    'agency:create',
    'agency:update',
    'agency:delete',
    'user:view',
    'user:create',
    'user:update',
    'user:delete',
    'client:view',
    'client:create',
    'client:update',
    'client:delete',
    'campaign:view',
    'campaign:create',
    'campaign:update',
    'campaign:delete',
    'lead:view',
    'lead:create',
    'lead:update',
    'lead:delete',
    'lead:approve',
    'lead:reject',
    'scrape:view',
    'scrape:create',
    'scrape:delete',
    'cleanroom:view',
    'cleanroom:create',
    'cleanroom:execute',
    'research_iq:view_own',
    'research_iq:view_all',
    'cost:view',
    'cost:export',
    'time_log:view_own',
    'time_log:view_all',
    'time_log:create',
    'time_log:update',
    'time_log:delete',
  ],
  agency_admin: [
    // Agency-scoped full access
    'agency:view',
    'user:view',
    'user:create',
    'user:update',
    'client:view',
    'client:create',
    'client:update',
    'client:delete',
    'campaign:view',
    'campaign:create',
    'campaign:update',
    'campaign:delete',
    'lead:view',
    'lead:create',
    'lead:update',
    'lead:delete',
    'lead:approve',
    'lead:reject',
    'scrape:view',
    'cleanroom:view',
    'cleanroom:create',
    'cleanroom:execute',
    'research_iq:view_all',
    'cost:view',
    'cost:export',
    'time_log:view_all',
  ],
  researcher: [
    // Limited operational access
    'agency:view',
    'client:view',
    'campaign:view',
    'lead:view',
    'lead:create',
    'lead:update',
    'scrape:view',
    'scrape:create',
    'cleanroom:view',
    'research_iq:view_own',
    'time_log:view_own',
    'time_log:create',
    'time_log:update',
    'time_log:delete',
  ],
  client: [
    // Read-only campaign and leads
    'campaign:view',
    'lead:view',
    'cost:view',
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Role hierarchy checks
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function isAgencyAdmin(role: UserRole): boolean {
  return role === 'agency_admin';
}

export function isResearcher(role: UserRole): boolean {
  return role === 'researcher';
}

export function isClient(role: UserRole): boolean {
  return role === 'client';
}

// Check if role can manage users
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'user:create');
}

// Check if role can approve leads
export function canApproveLeads(role: UserRole): boolean {
  return hasPermission(role, 'lead:approve');
}

// Check if role can view all research IQ
export function canViewAllResearchIQ(role: UserRole): boolean {
  return hasPermission(role, 'research_iq:view_all');
}

// Check if role can export cost data
export function canExportCosts(role: UserRole): boolean {
  return hasPermission(role, 'cost:export');
}
