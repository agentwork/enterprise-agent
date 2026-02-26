import { ClientForm } from "@/features/crm/components/client-form";

export default function NewClientPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
        <p className="text-muted-foreground mt-2">
          Create a new client record to track deals and activities.
        </p>
      </div>
      
      <ClientForm />
    </div>
  );
}
