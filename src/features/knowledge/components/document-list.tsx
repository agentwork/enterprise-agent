"use client";

import { Document } from "../types";
import { deleteDocument } from "../server/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(id);
    try {
      const result = await deleteDocument(id);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to delete document: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 border rounded-lg bg-muted/20 border-dashed">
        <p className="text-muted-foreground">No documents found in knowledge base.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-start justify-between p-4 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{doc.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="uppercase text-xs font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                {doc.fileType}
              </span>
              <span>•</span>
              <span>{format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
              {doc.content?.substring(0, 150)}...
            </p>
          </div>
          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deletingId === doc.id}
            className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
          >
            {deletingId === doc.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
