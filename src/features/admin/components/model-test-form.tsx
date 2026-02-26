"use client";

import { useState } from "react";
import { testModelConnection } from "../server/test-model";

export function ModelTestForm() {
  const [input, setInput] = useState("Hello, can you confirm our connection?");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await testModelConnection(input);
      if (result.success && result.response) {
        setResponse(result.response);
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Model Connection Test</h2>
      <p className="text-sm text-gray-500">
        Verify that your LLM provider is correctly configured and responding.
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Test Prompt</label>
        <textarea
          className="w-full p-2 border rounded-md min-h-[100px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a message to send to the model..."
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Testing..." : "Test Connection"}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-semibold text-green-800 mb-2">Response:</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Error:</h3>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
