import { createContext, useContext, type ReactNode } from "react";

import type { Permission } from "@/services/core/permissions";

export interface AdminIdentity {
  userId: string;
  email: string | null;
  fullName: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  accountStatus: string;
  roles: string[];
  permissions: string[];
  isStaff: boolean;
}

const AdminContext = createContext<AdminIdentity | null>(null);

export function AdminProvider({ value, children }: { value: AdminIdentity; children: ReactNode }) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminIdentity {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin doit être utilisé dans AdminProvider");
  return value;
}

/**
 * Affichage conditionnel côté client. Ce n'est PAS une garantie de sécurité :
 * chaque action est revérifiée côté serveur par `requirePermission`.
 */
export function useCan(): (permission?: Permission | string) => boolean {
  const { permissions, roles } = useAdmin();
  return (permission) => {
    if (!permission) return true;
    if (roles.includes("super_admin")) return true;
    return permissions.includes(permission);
  };
}
