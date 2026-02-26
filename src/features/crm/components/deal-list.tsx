"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Deal {
  id: string;
  clientId: string;
  title: string;
  amount: string | null;
  stage: "lead" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: string | null;
  expectedCloseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DealListProps {
  deals: Deal[];
}

const stageColors = {
  lead: "bg-blue-100 text-blue-800",
  qualification: "bg-purple-100 text-purple-800",
  proposal: "bg-yellow-100 text-yellow-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed_won: "bg-green-100 text-green-800",
  closed_lost: "bg-red-100 text-red-800",
};

const formatCurrency = (amount: string | null) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(amount));
};

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

export function DealList({ deals }: DealListProps) {
  const router = useRouter();

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20 border-dashed">
        <p className="text-muted-foreground mb-4">No deals found</p>
        <Link
          href="/dashboard/crm/deals/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Create your first deal
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="group relative flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/dashboard/crm/deals/${deal.id}`)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold tracking-tight text-lg line-clamp-1">{deal.title}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
                  stageColors[deal.stage] || "bg-gray-100 text-gray-800"
                }`}
              >
                {deal.stage.replace("_", " ")}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Amount</span>
                <span className="font-medium">{formatCurrency(deal.amount)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Probability</span>
                <span className="font-medium">{deal.probability ? `${deal.probability}%` : "-"}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-muted-foreground text-xs">Expected Close</span>
                <span className="font-medium">{formatDate(deal.expectedCloseDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-end">
            <Link
              href={`/dashboard/crm/deals/${deal.id}`}
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
