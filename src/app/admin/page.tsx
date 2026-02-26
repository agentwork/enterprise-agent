import Link from "next/link";
import { getMCPServers, getSystemSetting } from "@/features/admin/server/actions";

export default async function AdminDashboard() {
  const mcpServers = await getMCPServers();
  const llmProvider = await getSystemSetting("llm_provider");

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">LLM Provider</span>
              <span className="font-medium">{String(llmProvider?.value || "Not Configured")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Active MCP Servers</span>
              <span className="font-medium text-green-600">
                {mcpServers.filter(s => s.isEnabled).length} / {mcpServers.length}
              </span>
            </div>
          </div>
          <div className="mt-4">
             <Link href="/admin/settings" className="text-blue-600 hover:underline text-sm">
                Manage Settings &rarr;
             </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border opacity-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">User Management</h3>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
