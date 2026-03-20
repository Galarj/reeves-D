'use client';

import { useState } from 'react';
import { SearchResult, FollowUpMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Brain, CheckCircle2, Zap, MessageSquare, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface SynthesisPanelProps {
  result: SearchResult;
  query: string;
}

export default function SynthesisPanel({ result, query }: SynthesisPanelProps) {
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleAsk = async () => {
    if (!input.trim() || isAsking) return;
    const question = input.trim();
    setInput('');
    setIsAsking(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synthesis: result.synthesis,
          agreements: result.agreements,
          conflicts: result.conflicts,
          question,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || 'Unable to answer.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="h-8 w-8 rounded-lg bg-blue-600/30 flex items-center justify-center">
          <Brain className="h-4 w-4 text-blue-300" />
        </div>
        <div>
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">AI Synthesis</p>
          <p className="text-xs text-white/40 mt-0.5 truncate max-w-xs">Based on 5 sources for: {query}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Main synthesis text */}
        <p className="text-sm text-white/80 leading-relaxed">{result.synthesis}</p>

        {/* Agreements */}
        {result.agreements?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Consensus Points
            </p>
            <div className="space-y-1.5">
              {result.agreements.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 flex-shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflicts */}
        {result.conflicts?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Active Debates
            </p>
            <div className="space-y-1.5">
              {result.conflicts.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up chat toggle */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 text-sm text-violet-400/80 hover:text-violet-300 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Ask a follow-up question
            {showChat ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showChat && (
            <div className="mt-3 space-y-3">
              {/* Chat history */}
              {messages.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'px-3 py-2.5 rounded-xl text-sm',
                        msg.role === 'user'
                          ? 'bg-violet-600/20 border border-violet-500/20 text-violet-200 ml-8'
                          : 'bg-white/5 border border-white/10 text-white/75 mr-8'
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/40">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking...
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder="Ask about the sources, findings, or gaps..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/40 transition-colors"
                />
                <button
                  onClick={handleAsk}
                  disabled={!input.trim() || isAsking}
                  className="px-4 py-2.5 bg-violet-600/80 hover:bg-violet-600 disabled:opacity-40 rounded-xl transition-all text-white"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
