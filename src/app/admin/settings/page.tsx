import { getMCPServers, getSystemSetting } from "@/features/admin/server/actions";
import { SettingsForm } from "@/features/admin/components/settings-form";
import { MCPServerList } from "@/features/admin/components/mcp-server-list";

export default async function SettingsPage() {
  const llmProvider = await getSystemSetting("llm_provider");
  const llmApiKey = await getSystemSetting("llm_api_key");
  const llmModelName = await getSystemSetting("llm_model_name");
  
  const mcpServers = await getMCPServers();

  const initialSettings = {
    llm_provider: (llmProvider?.value as string) || "openai",
    llm_api_key: (llmApiKey?.value as string) || "",
    llm_model_name: (llmModelName?.value as string) || "gpt-4o",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SettingsForm initialSettings={initialSettings} />
        </div>
        <div>
          <MCPServerList servers={mcpServers} />
        </div>
      </div>
    </div>
  );
}
