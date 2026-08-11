import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { ADMIN_NAV } from "./nav-config";
import { useAdmin, useCan } from "./admin-context";
import { BrandLockup } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  editor: "Éditeur",
  sales: "Commercial",
  support: "Support",
  finance: "Finance",
  viewer: "Lecture seule",
  client: "Client",
};

function AdminSidebar() {
  const can = useCan();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/admin" aria-label="Tableau de bord Zawena">
          <BrandLockup size={26} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {ADMIN_NAV.map((group) => {
          const items = group.items.filter((item) => can(item.permission));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive(item.to, item.exact)} tooltip={item.label}>
                        <Link to={item.to as never} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4">
        <Button asChild variant="ghost" size="sm" className="justify-start gap-2">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            <span>Voir le site</span>
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminTopbar() {
  const identity = useAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const initials = (identity.fullName ?? identity.email ?? "Z")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-5">
      <SidebarTrigger />
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 pl-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials || "Z"}
            </span>
            <span className="hidden text-sm sm:inline">{identity.fullName ?? identity.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="space-y-1">
            <p className="text-sm font-medium">{identity.fullName ?? "Compte Zawena"}</p>
            <p className="text-xs font-normal text-muted-foreground">{identity.email}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {identity.roles.map((role) => ROLE_LABEL[role] ?? role).join(", ") || "Aucun rôle"}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/admin/settings/profile">Mon profil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void signOut()} className="text-destructive">
            <LogOut className="size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-muted/20">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8">
            <div className="mx-auto w-full max-w-[1400px] space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
