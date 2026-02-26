import { notFound } from "next/navigation";
import { getClient, getDealsByClient, getActivitiesByClient } from "@/features/crm/server/actions";
import { ClientForm } from "@/features/crm/components/client-form";
import { DealList } from "@/features/crm/components/deal-list";
import { ActivityFeed } from "@/features/crm/components/activity-feed";

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;
  
  const [clientResult, dealsResult, activitiesResult] = await Promise.all([
    getClient(id),
    getDealsByClient(id),
    getActivitiesByClient(id),
  ]);

  if (!clientResult.success || !clientResult.data) {
    notFound();
  }

  const client = clientResult.data;
  const deals = dealsResult.success && dealsResult.data ? dealsResult.data : [];
  const activities = activitiesResult.success && activitiesResult.data ? activitiesResult.data : [];

  // Transform data to match form input type (handling nulls)
  const initialData = {
    id: client.id,
    name: client.name,
    industry: client.industry || undefined,
    description: client.description || undefined,
    website: client.website || undefined,
  };

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Client Details</h1>
          <p className="text-muted-foreground mt-2">
            Manage client information, deals, and activities.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Information</h2>
          <ClientForm initialData={initialData} isEditMode={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Deals</h2>
          </div>
          <DealList deals={deals} />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Activities</h2>
          </div>
          <ActivityFeed entityType="client" entityId={client.id} activities={activities} />
        </div>
      </div>
    </div>
  );
}
