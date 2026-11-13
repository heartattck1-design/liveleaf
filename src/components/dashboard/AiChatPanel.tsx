import { useState } from 'react';
import { Bot, RefreshCw, Send, User } from 'lucide-react';

import { sendAiChatMessage, type ChatMessage } from '../../services/api';

interface AiChatPanelProps {
  theme: 'light' | 'dark';
}

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function AiChatPanel({ theme }: AiChatPanelProps) {
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your LiveLeaf AI Assistant. Ask me about your plant health or sensor readings.',
      timestamp: getTimestamp(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');
    setChatError(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: getTimestamp(),
    };

    setMessages((current) => [...current, userMessage]);
    setIsSending(true);

    try {
      const response = await sendAiChatMessage(userText, messages);
      if (typeof response.reply !== 'string' || !response.reply.trim()) {
        throw new Error('The /ai endpoint returned no valid reply.');
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        sender: 'assistant',
        text: response.reply,
        timestamp: getTimestamp(),
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      setChatError(
        requestError instanceof Error
          ? `Could not get a reply from /ai: ${requestError.message}`
          : 'Could not get a reply from /ai. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={['flex items-start gap-2', message.sender === 'user' ? 'flex-row-reverse' : ''].join(' ')}
          >
            <div
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                message.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950'
                  : isDark
                    ? 'border border-slate-700 bg-slate-800 text-emerald-400'
                    : 'bg-emerald-100 text-emerald-700',
              ].join(' ')}
            >
              {message.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={[
                'max-w-[82%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed',
                message.sender === 'user'
                  ? 'bg-emerald-500 font-medium text-slate-950'
                  : isDark
                    ? 'border border-slate-700/50 bg-slate-800 text-slate-200'
                    : 'bg-slate-100 text-slate-800',
              ].join(' ')}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <span className="mt-1 block text-[10px] opacity-60">{message.timestamp}</span>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
            Waiting for the AI response...
          </div>
        )}
      </div>

      {chatError && (
        <p role="alert" className="mx-4 mb-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600">
          {chatError}
        </p>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-700/10 p-3">
        <input
          type="text"
          value={inputPrompt}
          onChange={(event) => setInputPrompt(event.target.value)}
          placeholder="Ask about your plant..."
          aria-label="Message the LiveLeaf AI assistant"
          className={[
            'min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-emerald-500',
            isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
              : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400',
          ].join(' ')}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!inputPrompt.trim() || isSending}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
