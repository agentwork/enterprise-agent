import { getDeal, getClients, getActivitiesByDeal } from "@/features/crm/server/actions";
import { DealForm } from "@/features/crm/components/deal-form";
import { ActivityFeed } from "@/features/crm/components/activity-feed";
import { notFound } from "next/navigation";

interface DealPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  
  const [dealResult, clientsResult, activitiesResult] = await Promise.all([
    getDeal(id),
    getClients(),
    getActivitiesByDeal(id),
  ]);

  if (!dealResult.success || !dealResult.data) {
    notFound();
  }

  const deal = dealResult.data;
  const clients = clientsResult.success && clientsResult.data ? clientsResult.data : [];
  const activities = activitiesResult.success && activitiesResult.data ? activitiesResult.data : [];
  
  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
  }));

  const initialData = {
    id: deal.id,
    clientId: deal.clientId,
    title: deal.title,
    amount: deal.amount ? parseFloat(deal.amount) : undefined,
    stage: deal.stage,
    probability: deal.probability ? parseFloat(deal.probability) : undefined,
    expectedCloseDate: deal.expectedCloseDate || undefined,
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Deal Details</h1>
        <p className="text-muted-foreground mt-2">
          Update deal details and track progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Information</h2>
            <DealForm 
              initialData={initialData} 
              clients={clientOptions}
              isEditMode={true} 
            />
          </div>
        </div>
        
        <div>
           <div className="mb-4">
            <h2 className="text-2xl font-bold">Activities</h2>
           </div>
           <ActivityFeed entityType="deal" entityId={deal.id} activities={activities} />
        </div>
      </div>
    </div>
  );
}
