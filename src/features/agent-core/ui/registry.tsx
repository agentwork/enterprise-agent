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
  "sql_db_query": (props) => <DataChart data={Array.isArray(props.data) ? props.data : (props.data as { rows: unknown[] })?.rows || []} />,
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

  if (!Component) {
    // Default fallback: JSON view
    return (
      <div className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96 text-sm font-mono border border-gray-200">
        <div className="font-bold text-gray-500 mb-2">Output ({toolName}):</div>
        <pre>{JSON.stringify(parsedData, null, 2)}</pre>
      </div>
    );
  }

  return React.createElement(Component, { data: parsedData, toolCallId });
}
