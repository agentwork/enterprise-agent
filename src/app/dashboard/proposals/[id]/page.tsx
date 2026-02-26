import { getProposal } from "@/features/proposal-generator/server/actions";
import { ProposalEditor } from "@/features/proposal-generator/components/proposal-editor";

interface ProposalPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params;
  const { data: proposal, success, error } = await getProposal(id);

  if (!success || !proposal) {
    return <div>Error: {error || "Proposal not found"}</div>;
  }

  // Cast proposal content to match editor expectations if needed, though Drizzle might return it as any/unknown
  // We'll let the component handle the structure
  const editorProposal = {
    id: proposal.id,
    clientId: proposal.clientId,
    title: proposal.title,
    status: proposal.status ?? "draft", // Provide default status
    content: proposal.content as {
      sections: {
        id: string;
        title: string;
        type: string;
        content: unknown;
      }[];
    },
    client: proposal.client ? { name: proposal.client.name } : undefined,
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Proposal</h2>
      </div>
      <ProposalEditor proposal={editorProposal} />
    </div>
  );
}
