"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDocumentSchema, type CreateDocumentInput } from "../types";
import { createDocument } from "../server/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DocumentForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema) as Resolver<CreateDocumentInput>,
    defaultValues: {
      title: "",
      content: "",
      fileType: "text",
    },
  });

  const onSubmit = async (data: CreateDocumentInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createDocument(data);

      if (result.success) {
        reset();
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
        <h2 className="text-lg font-semibold">Add New Document</h2>
        
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium leading-none">
            Document Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Employee Handbook"
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="fileType" className="text-sm font-medium leading-none">
            File Type
          </label>
          <select
            id="fileType"
            {...register("fileType")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="text">Plain Text</option>
            <option value="markdown">Markdown</option>
            <option value="pdf">PDF (Text content only)</option>
          </select>
          {errors.fileType && <p className="text-sm text-destructive">{errors.fileType.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium leading-none">
            Content
          </label>
          <textarea
            id="content"
            {...register("content")}
            className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Paste document content here..."
          />
          {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          {isSubmitting ? "Processing..." : "Ingest Document"}
        </button>
      </div>
    </form>
  );
}
