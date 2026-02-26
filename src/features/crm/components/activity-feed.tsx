"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateActivitySchema, type CreateActivityInput } from "@/features/crm/utils/validation";
import { createActivity, deleteActivity } from "@/features/crm/server/actions";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Users, Mail, CheckSquare, Trash2 } from "lucide-react";

interface Activity {
  id: string;
  type: "note" | "call" | "meeting" | "email" | "task";
  content: string;
  sentiment: string | null;
  performedAt: Date;
  createdAt: Date;
}

interface ActivityFeedProps {
  entityType: "client" | "deal";
  entityId: string;
  activities: Activity[];
}

const activityIcons = {
  note: MessageSquare,
  call: Phone,
  meeting: Users,
  email: Mail,
  task: CheckSquare,
};

const activityColors = {
  note: "bg-blue-100 text-blue-600",
  call: "bg-green-100 text-green-600",
  meeting: "bg-purple-100 text-purple-600",
  email: "bg-yellow-100 text-yellow-600",
  task: "bg-gray-100 text-gray-600",
};

export function ActivityFeed({ entityType, entityId, activities }: ActivityFeedProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: {
      type: "note",
      content: "",
      [entityType === "client" ? "clientId" : "dealId"]: entityId,
    },
  });

  const onSubmit = async (data: CreateActivityInput) => {
    setIsSubmitting(true);
    try {
      // Ensure the correct ID is set
      const payload = {
        ...data,
        clientId: entityType === "client" ? entityId : undefined,
        dealId: entityType === "deal" ? entityId : undefined,
      };
      
      const result = await createActivity(payload);
      if (result.success) {
        reset();
        router.refresh();
      } else {
        console.error(result.error);
        alert("Failed to create activity: " + result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    
    try {
      const result = await deleteActivity(id);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to delete activity");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <h3 className="font-semibold mb-4">Add Activity</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/4">
              <select
                {...register("type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                {...register("content")}
                placeholder="What happened?"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.content ? <p className="text-sm text-destructive mt-1">{errors.content.message as string}</p> : null}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Timeline</h3>
        <div className="relative border-l ml-4 space-y-8 pb-4">
          {activities.length === 0 && (
            <p className="text-muted-foreground text-sm ml-6">No activities recorded yet.</p>
          )}
          
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <div key={activity.id} className="relative ml-6">
                <span className={`absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-background ${activityColors[activity.type]}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none capitalize">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.performedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(activity.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm mt-2">{activity.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
