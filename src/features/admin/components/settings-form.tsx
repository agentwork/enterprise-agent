"use client";

import { useState } from "react";
import { setSystemSetting } from "../server/actions";

interface SettingsFormProps {
  initialSettings: {
    llm_provider: string;
    llm_api_key: string;
    llm_model_name: string;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [provider, setProvider] = useState(initialSettings.llm_provider || "openai");
  const [apiKey, setApiKey] = useState(initialSettings.llm_api_key || "");
  const [modelName, setModelName] = useState(initialSettings.llm_model_name || "gpt-4o");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await setSystemSetting("llm_provider", provider, "LLM Provider (openai/anthropic)");
      await setSystemSetting("llm_api_key", apiKey, "LLM API Key", true);
      await setSystemSetting("llm_model_name", modelName, "LLM Model Name");
      setMessage("Settings saved successfully!");
    } catch (error) {
        console.error("Failed to save settings:", error);
        setMessage("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">LLM Configuration</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Model Name</label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="gpt-4o"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="sk-..."
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </button>
        {message && <span className="ml-4 text-sm text-gray-600">{message}</span>}
      </div>
    </form>
  );
}
