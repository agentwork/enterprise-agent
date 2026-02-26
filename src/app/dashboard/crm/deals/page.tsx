import { getDeals } from "@/features/crm/server/actions";
import { DealList } from "@/features/crm/components/deal-list";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const result = await getDeals();
  const deals = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground mt-2">
            Manage your sales pipeline and track deal progress.
          </p>
        </div>
        <Link
          href="/dashboard/crm/deals/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Deal
        </Link>
      </div>

      <DealList deals={deals} />
    </div>
  );
}
