import Link from "next/link";
import { getDocuments } from "@/features/knowledge/server/actions";
import { DocumentList } from "@/features/knowledge/components/document-list";

import { Document } from "@/features/knowledge/types";

export default async function KnowledgePage() {
  const result = await getDocuments();
  const documents = (result.success && result.data ? result.data : []) as Document[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Manage company documents and knowledge for the AI agent.
          </p>
        </div>
        <Link
          href="/dashboard/knowledge/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Add Document
        </Link>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
