import { DocumentForm } from "@/features/knowledge/components/document-form";

export default function NewDocumentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Document</h1>
        <p className="text-muted-foreground">
          Upload or paste content to the knowledge base.
        </p>
      </div>
      <DocumentForm />
    </div>
  );
}
