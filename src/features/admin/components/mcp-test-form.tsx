"use client";

import { useState } from "react";
import { testMCPConnection, callMCPTool } from "../server/test-mcp";

export function MCPTestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<{ name: string; description?: string }[]>([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [args, setArgs] = useState("{}");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await testMCPConnection();
      if (res.success && res.tools) {
        setTools(res.tools);
        if (res.tools.length > 0) setSelectedTool(res.tools[0].name);
      } else {
        setError(res.error || "Failed to fetch tools");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallTool = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(args);
      } catch {
        setError("Invalid JSON arguments");
        setIsLoading(false);
        return;
      }

      const res = await callMCPTool(selectedTool, parsedArgs);
      if (res.success) {
        setResult(res.result);
      } else {
        setError(res.error || "Failed to call tool");
      }
    } catch {
      setError("Failed to execute query");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
      <div className="flex flex-col gap-4">
        <button
          onClick={handleFetchTools}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-all font-medium"
        >
          {isLoading ? "Connecting..." : "Connect & List Tools"}
        </button>

        {tools.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Select Tool</label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full p-2 border rounded-md bg-background text-sm"
              >
                {tools.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} - {t.description || "No description"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Arguments (JSON)</label>
              <textarea
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                rows={5}
                className="w-full p-3 border rounded-md font-mono text-sm bg-background"
                placeholder='{ "query": "SELECT * FROM clients LIMIT 5" }'
              />
            </div>

            <button
              onClick={handleCallTool}
              disabled={isLoading || !selectedTool}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-all font-medium"
            >
              {isLoading ? "Executing..." : "Run Tool"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md whitespace-pre-wrap">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!!result && (
        <div className="space-y-2">
          <label className="text-sm font-semibold">Result</label>
          <pre className="p-4 bg-muted rounded-md overflow-auto text-xs max-h-[400px]">
            {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
