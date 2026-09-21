"use client";

import { useState } from "react";
import { X, MessageSquare, Send, Sparkles } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { ASK_ASSISTANT } from "@/graphql/operations";
import ReactMarkdown from "react-markdown";

export default function InventoryAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hi there! I'm your Gemini Inventory Assistant. You can ask me things like:\n- What products are low on stock?\n- How much is my inventory worth?\n- Draft an email to re-order mice." }
  ]);
  const [input, setInput] = useState("");
  
  const [askAssistant, { loading }] = useMutation(ASK_ASSISTANT);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data } = await askAssistant({ variables: { message: userMessage } });
      if (data?.askInventoryAssistant) {
        setMessages(prev => [...prev, { role: 'ai', content: data.askInventoryAssistant }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I ran into an error connecting to the server." }]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition hover:scale-105 flex items-center justify-center z-40"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
              <div className="flex items-center text-zinc-900 font-bold">
                <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
                Gemini Assistant
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-100 text-zinc-900 rounded-bl-none'}`}>
                    {msg.role === 'ai' ? (
                      <div className="prose prose-sm prose-zinc">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 text-zinc-500 p-3 rounded-2xl rounded-bl-none text-sm animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 bg-white">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your inventory..." 
                  className="w-full pl-4 pr-12 py-3 border border-zinc-300 rounded-full text-sm text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
