'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import type { UserRole } from '@dashin/shared-types';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type Permission,
} from './permissions';

// Hook to check permissions
export function usePermissions() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || undefined;

  return {
    hasPermission: (permission: Permission) => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    hasAnyPermission: (permissions: Permission[]) => {
      if (!role) return false;
      return hasAnyPermission(role, permissions);
    },
    hasAllPermissions: (permissions: Permission[]) => {
      if (!role) return false;
      return hasAllPermissions(role, permissions);
    },
  };
}

// Hook to check role
export function useRole() {
  const { user } = useUser();
  return (user?.publicMetadata?.role as UserRole) || undefined;
}

// Component to conditionally render based on permissions
export function Can({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission: checkPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let canAccess = false;

  if (permission) {
    canAccess = checkPermission(permission);
  } else if (permissions) {
    canAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return canAccess ? <>{children}</> : <>{fallback}</>;
}

// Component to conditionally render based on role
export function IsRole({
  role,
  roles,
  children,
  fallback = null,
}: {
  role?: UserRole;
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const userRole = useRole();

  const hasRole = role ? userRole === role : roles ? roles.includes(userRole!) : false;

  return hasRole ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component for permission-based rendering
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ComponentType<P>
) {
  return function PermissionGuard(props: P) {
    const { hasPermission: checkPermission } = usePermissions();

    if (!checkPermission(permission)) {
      return fallback ? <>{React.createElement(fallback, props)}</> : null;
    }

    return <Component {...props} />;
  };
}

// Higher-order component for role-based rendering
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  fallback?: React.ComponentType<P>
) {
  return function RoleGuard(props: P) {
    const userRole = useRole();

    if (!userRole || !allowedRoles.includes(userRole)) {
      return fallback ? React.createElement(fallback, props) : null;
    }

    return <Component {...props} />;
  };
}
