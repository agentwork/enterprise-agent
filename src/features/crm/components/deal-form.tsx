"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDealSchema, type CreateDealInput, type UpdateDealInput } from "@/features/crm/utils/validation";
import { createDeal, updateDeal } from "@/features/crm/server/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClientOption {
  id: string;
  name: string;
}

interface DealFormProps {
  initialData?: UpdateDealInput;
  clients: ClientOption[];
  isEditMode?: boolean;
}

export function DealForm({ initialData, clients, isEditMode = false }: DealFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(CreateDealSchema),
    defaultValues: initialData || {
      title: "",
      clientId: "",
      amount: undefined,
      stage: "lead",
      probability: 10,
      expectedCloseDate: undefined,
    },
  });

  const onSubmit = async (data: CreateDealInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (isEditMode && initialData?.id) {
        result = await updateDeal({ ...data, id: initialData.id });
      } else {
        result = await createDeal(data);
      }

      if (result.success) {
        router.push("/dashboard/crm/deals");
        router.refresh();
      } else {
        setError(result.error || "An unexpected error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Deal Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="New Software License Deal"
          />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message as string}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="clientId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Client
          </label>
          <select
            id="clientId"
            {...register("clientId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isEditMode} // Usually we don't change client for a deal, but can be allowed if needed. Let's disable for now if edit.
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId ? <p className="text-sm text-destructive">{errors.clientId.message as string}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Amount ($)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="10000.00"
            />
            {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message as string}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="probability" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Probability (%)
            </label>
            <input
              id="probability"
              type="number"
              min="0"
              max="100"
              {...register("probability")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="50"
            />
            {errors.probability ? <p className="text-sm text-destructive">{errors.probability.message as string}</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="stage" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Stage
            </label>
            <select
              id="stage"
              {...register("stage")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="lead">Lead</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
            {errors.stage ? <p className="text-sm text-destructive">{errors.stage.message as string}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="expectedCloseDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Expected Close Date
            </label>
            <input
              id="expectedCloseDate"
              type="date"
              {...register("expectedCloseDate")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.expectedCloseDate ? <p className="text-sm text-destructive">{errors.expectedCloseDate.message as string}</p> : null}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update Deal" : "Create Deal"}
        </button>
      </div>
    </form>
  );
}
