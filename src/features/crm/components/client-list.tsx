"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the client type based on the DB schema or server action return
// For now, I'll define an interface that matches the expected data structure
interface Client {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter();

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20 border-dashed">
        <p className="text-muted-foreground mb-4">No clients found</p>
        <Link
          href="/dashboard/crm/clients/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Create your first client
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <div
          key={client.id}
          className="group relative flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/dashboard/crm/clients/${client.id}`)}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">{client.name}</h3>
              {client.industry && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  {client.industry}
                </span>
              )}
            </div>
            {client.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {client.description}
              </p>
            )}
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-2"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Website ↗
              </a>
            )}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-end">
            <Link
              href={`/dashboard/crm/clients/${client.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
