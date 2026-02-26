export interface TemplateSection {
  id: string;
  title: string;
  type: "text" | "table" | "list";
  prompt: string;
}

export interface ProposalContentSection {
  id: string;
  title: string;
  type: "text" | "table" | "list";
  content: string | string[] | Record<string, unknown> | unknown; // Flexible content based on type
}

export interface ProposalContent {
  sections: ProposalContentSection[];
}
