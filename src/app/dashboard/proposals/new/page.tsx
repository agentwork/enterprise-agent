import { ProposalForm } from "@/features/proposal-generator/components/proposal-form";
import { getTemplates } from "@/features/proposal-generator/server/actions";
import { getClients } from "@/features/crm/server/actions";

export default async function NewProposalPage() {
  const [templatesResult, clientsResult] = await Promise.all([
    getTemplates(),
    getClients(),
  ]);

  const templates = (templatesResult.success && templatesResult.data) ? templatesResult.data.map(t => ({
    ...t,
    structure: t.structure as { id: string; title: string; type: string }[]
  })) : [];
  const clients = (clientsResult.success && clientsResult.data) ? clientsResult.data : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Proposal</h2>
      </div>
      <ProposalForm clients={clients || []} templates={templates || []} />
    </div>
  );
}
