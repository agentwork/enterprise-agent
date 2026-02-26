"use client";

import { FileText, ExternalLink } from "lucide-react";

interface DocumentPreviewProps {
  documents: Array<{
    title?: string;
    content: string;
    metadata?: Record<string, unknown>;
    url?: string;
  }>;
}

export function DocumentPreview({ documents }: DocumentPreviewProps) {
  if (!documents || documents.length === 0) {
    return <div className="text-gray-500 italic">No documents found.</div>;
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, idx) => (
        <div key={idx} className="p-4 border rounded bg-white hover:bg-gray-50 transition-colors shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium text-sm text-gray-800">
                {doc.title || (doc.metadata?.title as string) || `Document ${idx + 1}`}
              </h4>
            </div>
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">
            {doc.content.slice(0, 300)}...
          </p>
          {doc.metadata && Object.keys(doc.metadata).length > 0 && (
             <div className="mt-2 flex gap-2 flex-wrap">
                {Object.entries(doc.metadata).map(([k, v]) => (
                    k !== "title" && (
                        <span key={k} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                            {k}: {String(v)}
                        </span>
                    )
                ))}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}
