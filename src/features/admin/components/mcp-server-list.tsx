"use client";

import { useState } from "react";
import { addMCPServer, deleteMCPServer, updateMCPServer } from "../server/actions";

interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[] | null;
  env: Record<string, string> | null;
  isEnabled: boolean;
}

interface MCPServerListProps {
  servers: MCPServer[];
}

export function MCPServerList({ servers }: MCPServerListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    command: "",
    args: "[]",
    env: "{}",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedArgs: string[] = [];
      let parsedEnv: Record<string, string> = {};

      try {
        parsedArgs = JSON.parse(formData.args);
        if (!Array.isArray(parsedArgs)) throw new Error("Args must be an array");
      } catch {
        alert("Invalid JSON for args");
        return;
      }

      try {
        parsedEnv = JSON.parse(formData.env);
        if (typeof parsedEnv !== "object" || Array.isArray(parsedEnv)) throw new Error("Env must be an object");
      } catch {
        alert("Invalid JSON for env");
        return;
      }

      await addMCPServer({
        name: formData.name,
        command: formData.command,
        args: parsedArgs,
        env: parsedEnv,
        isEnabled: true,
      });

      setIsAdding(false);
      setFormData({ name: "", command: "", args: "[]", env: "{}" });
    } catch (error) {
      console.error("Failed to add server:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this server?")) {
      await deleteMCPServer(id);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await updateMCPServer(id, { isEnabled: !currentStatus });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">MCP Servers</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          {isAdding ? "Cancel" : "Add Server"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 border border-gray-200 rounded bg-gray-50 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. supabase"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Command</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="e.g. npx"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Args (JSON Array)</label>
            <textarea
              className="w-full p-2 border rounded font-mono text-xs"
              value={formData.args}
              onChange={(e) => setFormData({ ...formData, args: e.target.value })}
              placeholder='["-y", "@modelcontextprotocol/server-supabase"]'
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Env (JSON Object)</label>
            <textarea
              className="w-full p-2 border rounded font-mono text-xs"
              value={formData.env}
              onChange={(e) => setFormData({ ...formData, env: e.target.value })}
              placeholder='{"SUPABASE_URL": "..."}'
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save Server
          </button>
        </form>
      )}

      <div className="space-y-2">
        {servers.length === 0 && <p className="text-gray-500 text-sm">No MCP servers configured.</p>}
        {servers.map((server) => (
          <div key={server.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
            <div>
              <div className="font-medium flex items-center gap-2">
                {server.name}
                <span className={`text-xs px-2 py-0.5 rounded-full ${server.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {server.isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                {server.command} {(server.args || []).join(" ")}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(server.id, server.isEnabled)}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
              >
                {server.isEnabled ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => handleDelete(server.id)}
                className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
