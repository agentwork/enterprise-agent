"use client";

import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolComponentProps<T = any> = {
  data: T;
  toolCallId?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolComponent<T = any> = React.ComponentType<ToolComponentProps<T>>;

const registry: Record<string, ToolComponent> = {};

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  toolCallId?: string;
}) {
  const Component = getToolComponent(toolName);

  if (!Component) {
    // Default fallback: JSON view
    return (
      <div className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96 text-sm font-mono border border-gray-200">
        <div className="font-bold text-gray-500 mb-2">Output ({toolName}):</div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  return React.createElement(Component, { data, toolCallId });
}
