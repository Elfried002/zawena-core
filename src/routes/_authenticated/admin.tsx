import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/admin/ui-bits";
import { getMyContextFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Espace opérationnel Zawena" },
      { name: "description", content: "Pilotage CRM, commercial, finance, support et contenus Zawena." },
      { property: "og:title", content: "Espace opérationnel Zawena" },
      { property: "og:description", content: "Centre opérationnel interne Zawena." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: () => getMyContextFn(),
  component: AdminLayout,
  errorComponent: AdminError,
});

function AdminLayout() {
  const identity = Route.useLoaderData();

  if (!identity.isStaff) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24">
        <EmptyState
          title="Accès non autorisé"
          description="Votre compte n'a pas de rôle interne Zawena. Contactez un administrateur pour obtenir un accès."
        />
      </div>
    );
  }

  return (
    <AdminProvider value={identity}>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminProvider>
  );
}

function AdminError() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <EmptyState
        title="Espace momentanément indisponible"
        description="Votre session a peut-être expiré. Rechargez la page ou reconnectez-vous."
      />
    </div>
  );
}
