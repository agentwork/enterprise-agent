"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Proposal {
  id: string;
  clientId: string;
  templateId: string;
  title: string;
  status: "draft" | "review" | "sent" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  client?: { name: string };
  template?: { name: string };
}

interface ProposalListProps {
  proposals: Proposal[];
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-blue-100 text-blue-800",
  sent: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function ProposalList({ proposals }: ProposalListProps) {
  const router = useRouter();

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20 border-dashed">
        <p className="text-muted-foreground mb-4">No proposals found</p>
        <Link
          href="/dashboard/proposals/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Create your first proposal
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="group relative flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/dashboard/proposals/${proposal.id}`)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold tracking-tight text-lg line-clamp-1">{proposal.title}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
                  statusColors[proposal.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {proposal.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Client</span>
                <span className="font-medium">{proposal.client?.name || "Unknown"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Template</span>
                <span className="font-medium">{proposal.template?.name || "Unknown"}</span>
              </div>
               <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Created</span>
                <span className="font-medium">{new Date(proposal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-end">
            <Link
              href={`/dashboard/proposals/${proposal.id}`}
              className="text-sm font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
