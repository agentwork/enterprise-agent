"use client";

import { useState } from "react";
import { updateProposal } from "@/features/proposal-generator/server/actions";
import { generateSectionContent } from "@/features/proposal-generator/server/generate";
import { Loader2, Wand2, Eye, Edit2, Save } from "lucide-react";

interface ProposalSection {
  id: string;
  title: string;
  type: string;
  content: string | string[] | Record<string, unknown> | unknown;
}

interface Proposal {
  id: string;
  clientId: string;
  title: string;
  status: string;
  content: {
    sections: ProposalSection[];
  };
  client?: { name: string };
}

interface ProposalEditorProps {
  proposal: Proposal;
}

export function ProposalEditor({ proposal }: ProposalEditorProps) {
  const [content, setContent] = useState(proposal.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Track generation state per section
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);

  const handleContentChange = (sectionId: string, value: string | string[] | Record<string, unknown>[]) => {
    const newSections = content.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, content: value };
      }
      return section;
    });
    setContent({ ...content, sections: newSections });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProposal(proposal.id, { content });
    setIsSaving(false);
    // Maybe show toast
  };

  const handleGenerate = async (section: ProposalSection) => {
    setGeneratingSectionId(section.id);
    try {
      const result = await generateSectionContent({
        clientId: proposal.clientId,
        sectionTitle: section.title,
        sectionType: section.type,
        proposalId: proposal.id,
      });

      if (result.success && result.data) {
        handleContentChange(section.id, result.data);
      } else {
        console.error("Failed to generate content:", result.error);
        // Maybe show toast error
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setGeneratingSectionId(null);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
            <p className="text-muted-foreground">Prepared for: {proposal.client?.name}</p>
          </div>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
          >
            <Edit2 className="w-4 h-4" /> Back to Edit
          </button>
        </div>

        <div className="bg-white p-8 shadow-lg rounded-lg min-h-[800px] print:shadow-none">
          {content.sections.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{section.title}</h2>
              <div className="prose max-w-none text-gray-600">
                {section.type === "list" && Array.isArray(section.content) ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.content.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="whitespace-pre-wrap">{(section.content as string) || <span className="italic text-gray-400">No content</span>}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm py-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">{proposal.title}</h2>
          <p className="text-muted-foreground">For: {proposal.client?.name}</p>
        </div>
        <div className="flex gap-2">
           <button
            onClick={() => setIsPreviewMode(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50 hover:bg-primary/90"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto bg-white p-8 shadow rounded-lg">
        {content.sections.map((section) => (
          <div key={section.id} className="space-y-2 p-4 border rounded-lg hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {section.title}
                <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-gray-100 rounded-full">
                  {section.type}
                </span>
              </h3>
              
              <button
                onClick={() => handleGenerate(section)}
                disabled={generatingSectionId === section.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md disabled:opacity-50"
                title="Generate content with AI"
              >
                {generatingSectionId === section.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {generatingSectionId === section.id ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            
            {section.type === "text" && (
              <textarea
                className="w-full p-3 border rounded-md min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-sans"
                value={section.content as string}
                onChange={(e) => handleContentChange(section.id, e.target.value)}
                placeholder={`Enter content for ${section.title}...`}
              />
            )}
            
            {section.type === "list" && (
               <div className="space-y-2">
                 <textarea
                    className="w-full p-3 border rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-sans"
                    value={Array.isArray(section.content) ? (section.content as string[]).join("\n") : (section.content as string)}
                    onChange={(e) => handleContentChange(section.id, e.target.value.split("\n"))}
                    placeholder="Enter items (one per line)..."
                 />
                 <p className="text-xs text-muted-foreground">Enter each item on a new line.</p>
               </div>
            )}

            {section.type === "table" && (
              <div className="space-y-4">
                 {Array.isArray(section.content) && section.content.length > 0 ? (
                   <div className="overflow-x-auto border rounded-md">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                         <tr>
                           {Object.keys(section.content[0] as object).map((header) => (
                             <th key={header} className="px-6 py-3">{header}</th>
                           ))}
                         </tr>
                       </thead>
                       <tbody>
                         {(section.content as Record<string, unknown>[]).map((row, idx) => (
                           <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                             {Object.values(row).map((val, i) => (
                               <td key={i} className="px-6 py-4">{val as string}</td>
                             ))}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 ) : (
                    <div className="p-8 border border-dashed rounded-md bg-gray-50 text-center text-muted-foreground">
                        <p>No table data yet. Generate with AI or enter JSON below.</p>
                    </div>
                 )}
                 
                 <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer mb-2">Edit Raw JSON</summary>
                    <textarea
                        className="w-full p-2 border rounded-md font-mono text-xs"
                        rows={5}
                        value={typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)}
                        onChange={(e) => {
                            const value = e.target.value;
                            try {
                                const parsed = JSON.parse(value);
                                if (Array.isArray(parsed)) {
                                    handleContentChange(section.id, parsed);
                                } else {
                                    handleContentChange(section.id, value);
                                }
                            } catch {
                                handleContentChange(section.id, value);
                            }
                        }}
                    />
                 </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
