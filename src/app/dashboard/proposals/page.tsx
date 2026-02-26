import { ProposalList } from "@/features/proposal-generator/components/proposal-list";
import { getProposals } from "@/features/proposal-generator/server/actions";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ProposalsPage() {
  const { data: proposals, success } = await getProposals();

  if (!success) {
    return <div>Failed to load proposals</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Proposals</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/proposals/new">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Create Proposal
            </button>
          </Link>
        </div>
      </div>
      <ProposalList proposals={proposals || []} />
    </div>
  );
}
