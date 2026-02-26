import { getClients } from "@/features/crm/server/actions";
import { DealForm } from "@/features/crm/components/deal-form";

export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  const result = await getClients();
  const clients = result.success && result.data ? result.data : [];

  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
  }));

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Deal</h1>
        <p className="text-muted-foreground mt-2">
          Add a new deal to your pipeline.
        </p>
      </div>
      
      <DealForm clients={clientOptions} />
    </div>
  );
}
