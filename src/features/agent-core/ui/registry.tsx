"use client";

import React from "react";
import { DataChart } from "./generative/data-chart";
import { DocumentPreview } from "./generative/document-preview";

export type ToolComponentProps<T = unknown> = {
  data: T;
  toolCallId?: string;
};

export type ToolComponent<T = unknown> = React.ComponentType<ToolComponentProps<T>>;

const registry: Record<string, ToolComponent> = {
  // Register default handlers for common tool types
  "sql_db_query": (props) => <DataChart data={props.data as Record<string, unknown>[]} />,
  "query": (props) => <DataChart data={props.data as Record<string, unknown>[]} />,
  "execute_sql": (props) => <DataChart data={props.data as Record<string, unknown>[]} />,
  "vector_search": (props) => <DocumentPreview documents={Array.isArray(props.data) ? props.data : (props.data as { documents: unknown[] })?.documents || []} />,
  "knowledge_search": (props) => <DocumentPreview documents={Array.isArray(props.data) ? props.data : (props.data as { documents: unknown[] })?.documents || []} />,
  // Add more mappings as needed based on actual tool names
};

export function registerToolComponent(toolName: string, component: ToolComponent) {
  registry[toolName] = component;
}

export function getToolComponent(toolName: string): ToolComponent | undefined {
  return registry[toolName];
}

export function ToolOutput({
  toolName,
  data,
  toolCallId,
}: {
  toolName: string;
  data: unknown;
  toolCallId?: string;
}) {
  const Component = getToolComponent(toolName);

  // Try to parse data if it's a string (e.g. from ToolMessage content)
  let parsedData = data;
  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data);
    } catch {
      // If parsing fails, use as is (e.g. raw text)
      parsedData = data;
    }
  }

  // Handle MCP format: { content: [{ type: "text", text: "..." }] }
  // Extract text and try to parse it if it's a string
  if (parsedData && typeof parsedData === "object" && "content" in parsedData) {
    const mcpContent = (parsedData as { content: unknown[] }).content;
    if (Array.isArray(mcpContent) && mcpContent.length > 0) {
      const firstContent = mcpContent[0] as { type: string; text?: string };
      if (firstContent.type === "text" && firstContent.text) {
        const text = firstContent.text;
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = text;
        }
      }
    }
  }

  // If the data is still just a wrapper, unwrap it
  if (parsedData && typeof parsedData === "object" && !Array.isArray(parsedData)) {
    // Check for common wrapper keys
    const wrapperKeys = ["rows", "data", "result", "items", "records"];
    for (const key of wrapperKeys) {
      if (key in (parsedData as Record<string, unknown>)) {
        const potentialArray = (parsedData as Record<string, unknown>)[key];
        if (Array.isArray(potentialArray)) {
          parsedData = potentialArray;
          break;
        }
      }
    }
  }

  if (!Component) {
    // Heuristic: If the data looks like a chart dataset (array of objects), try to render it as a chart
    if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0] === "object" && parsedData[0] !== null) {
      const firstRow = parsedData[0] as Record<string, unknown>;
      const keys = Object.keys(firstRow);
      // Check if any value looks like a number
      const hasNumeric = keys.some(k => {
        const val = firstRow[k];
        return typeof val === "number" || (typeof val === "string" && !isNaN(parseFloat(val.replace(/[$,\s]/g, ""))));
      });
      
      if (hasNumeric) {
        return <DataChart data={parsedData as Record<string, unknown>[]} title={`Output (${toolName})`} />;
      }
    }

    // Default fallback: JSON view
    return (
      <div className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96 text-sm font-mono border border-gray-200">
        <div className="font-bold text-gray-500 mb-2">Output ({toolName}):</div>
        <pre>{JSON.stringify(parsedData, null, 2)}</pre>
      </div>
    );
  }

  return React.createElement(Component, { data: parsedData as Record<string, unknown>[], toolCallId });
}
