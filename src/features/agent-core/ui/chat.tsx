"use client";

import { useState } from "react";
import { invokeAgent } from "../server/actions";
import { ToolOutput } from "./registry";

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    // Optimistic update
    const userMessage = {
      type: "human",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input immediately
    const currentInput = input;
    setInput("");

    try {
      // Invoke agent
      const result = await invokeAgent(currentInput, "default-thread");
      if (result && result.messages) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error("Failed to invoke agent:", error);
      // Optionally show error in UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto p-4 bg-white shadow-sm rounded-lg border">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
        {messages.length === 0 && (
           <div className="text-center text-gray-400 mt-20">
              Start a conversation with the Enterprise Agent.
           </div>
        )}
        
        {messages.map((msg, idx) => {
           const isUser = msg.type === "human";
           const isTool = msg.type === "tool";

           if (isTool) {
               // Render tool output using the registry
               return (
                   <div key={idx} className="flex justify-start">
                       <div className="bg-gray-50 border rounded-lg p-3 max-w-[90%] w-full">
                           <div className="text-xs text-gray-500 mb-1 font-mono">Tool Output ({msg.name || "unknown"})</div>
                           <ToolOutput 
                               toolName={msg.name || "unknown"}
                               data={msg.content}
                               toolCallId={msg.tool_call_id}
                           />
                       </div>
                   </div>
               );
           }

           return (
            <div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
                <div 
                    className={`p-4 rounded-lg max-w-[80%] ${
                        isUser 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                    <div className="font-bold text-xs mb-1 opacity-70">
                        {isUser ? "You" : "Agent"}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    {/* Render Tool Calls if any */}
                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {msg.tool_calls.map((tc: any, i: number) => (
                                <div key={i} className="bg-black/10 p-2 rounded text-xs font-mono overflow-x-auto">
                                    <div className="font-semibold text-blue-300">Tool Call: {tc.name}</div>
                                    <div>{JSON.stringify(tc.args, null, 2)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          );
        })}
        
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
                    Thinking...
                </div>
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
