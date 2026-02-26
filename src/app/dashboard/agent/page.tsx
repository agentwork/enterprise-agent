import { Chat } from "@/features/agent-core/ui/chat";

export default function AgentPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="text-xl font-bold text-gray-800">Enterprise Agent</h1>
        <p className="text-sm text-gray-500">
          Powered by LangGraph & MCP
        </p>
      </header>
      <main className="flex-1 bg-gray-50 p-4">
        <Chat />
      </main>
    </div>
  );
}
