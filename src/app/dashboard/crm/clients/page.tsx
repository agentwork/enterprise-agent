import Link from "next/link";
import { getClients } from "@/features/crm/server/actions";
import { ClientList } from "@/features/crm/components/client-list";

export default async function ClientsPage() {
  const result = await getClients();
  const clients = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage your client relationships and details.
          </p>
        </div>
        <Link
          href="/dashboard/crm/clients/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Add Client
        </Link>
      </div>

      <ClientList clients={clients} />
    </div>
  );
}
