import { useState, useEffect, useCallback } from 'react';
import { Send, Bot, User, RefreshCw, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { fetchPlantMetrics, sendAiChatMessage, type ChatMessage, type PlantMetricsResponse } from '../../services/api';

interface AiChatPanelProps {
  theme: 'light' | 'dark';
}

export function AiChatPanel({ theme }: AiChatPanelProps) {
  const isDark = theme === 'dark';
  const [metrics, setMetrics] = useState<PlantMetricsResponse | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your LiveLeaf AI Assistant powered by Gemini. Ask me anything about your plant health, soil moisture, or environmental conditions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    setMetricsError(null);
    try {
      const data = await fetchPlantMetrics();
      setMetrics(data);
    } catch {
      setMetricsError('Could not fetch plant metrics from server. Showing simulated offline status.');
      setMetrics({
        scientificName: 'Monstera deliciosa',
        commonName: 'Swiss Cheese Plant',
        soilMoisture: 68,
        temperatureC: 24.5,
        airHumidity: 55,
        lightLux: 4200,
        waterLevel: 85,
        status: 'Optimal',
        recommendations: ['Maintain current watering schedule', 'Adequate ambient sunlight detected'],
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await sendAiChatMessage(userText, messages);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply || 'Analysis completed successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.analysis) {
        setMetrics(res.analysis);
      }
    } catch {
      // Fallback intelligent response if backend /ai/ endpoint is unreachable in prototype demo mode
      const fallbackReplies = [
        'Based on your sensor telemetry, your plant soil moisture is stable at optimal levels.',
        'I recommend keeping the ambient temperature between 20°C and 26°C for best growth.',
        'Your ESP32 nodes are reporting healthy telemetry and active Wi-Fi connection.',
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `${randomReply} (Simulated AI response)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* Plant Analysis Metrics Card */}
      <div
        className={[
          'rounded-3xl border p-6 shadow-sm',
          isDark ? 'border-slate-800 bg-slate-900/90 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
        ].join(' ')}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Plant Analysis & Metrics</h2>
              <p className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
                Endpoint: <code className="font-mono text-emerald-500">/plant/analysis/metrics</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadMetrics}
            disabled={isLoadingMetrics}
            className={[
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
            ].join(' ')}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {metricsError && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600">
            {metricsError}
          </div>
        )}

        {metrics ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Species</span>
                <h3 className="text-base font-bold">{metrics.commonName || 'Smart Plant'}</h3>
                <p className="text-xs italic text-slate-400">{metrics.scientificName || 'Plantae'}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {metrics.status || 'Healthy'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={['rounded-2xl border p-3', isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'].join(' ')}>
                <span className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Soil Moisture</span>
                <p className="mt-1 text-xl font-black text-emerald-500">{metrics.soilMoisture ?? '--'}%</p>
              </div>
              <div className={['rounded-2xl border p-3', isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'].join(' ')}>
                <span className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Temperature</span>
                <p className="mt-1 text-xl font-black">{metrics.temperatureC ?? '--'}°C</p>
              </div>
              <div className={['rounded-2xl border p-3', isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'].join(' ')}>
                <span className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Air Humidity</span>
                <p className="mt-1 text-xl font-black">{metrics.airHumidity ?? '--'}%</p>
              </div>
              <div className={['rounded-2xl border p-3', isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'].join(' ')}>
                <span className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Light Intensity</span>
                <p className="mt-1 text-xl font-black">{metrics.lightLux ?? '--'} lx</p>
              </div>
            </div>

            {metrics.recommendations && metrics.recommendations.length > 0 && (
              <div className="rounded-2xl border border-slate-700/40 p-4">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">AI Recommendations</h4>
                <ul className="space-y-1.5 text-xs">
                  {metrics.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-400">Loading metrics...</div>
        )}
      </div>

      {/* AI Chatbot Agent Card */}
      <div
        className={[
          'flex flex-col rounded-3xl border p-6 shadow-sm',
          isDark ? 'border-slate-800 bg-slate-900/90 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
        ].join(' ')}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-4 border-slate-700/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Gemini Plant Assistant</h2>
              <p className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
                Endpoint: <code className="font-mono text-emerald-500">/ai/</code>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>

        {/* Message History */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[340px] min-h-[300px] mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={['flex items-start gap-3', msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'].join(' ')}
            >
              <div
                className={[
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs',
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950'
                    : isDark
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'bg-emerald-100 text-emerald-700',
                ].join(' ')}
              >
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={[
                  'max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm',
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium'
                    : isDark
                    ? 'bg-slate-800 text-slate-200 border border-slate-700/50'
                    : 'bg-slate-100 text-slate-800',
                ].join(' ')}
              >
                <p>{msg.text}</p>
                <span className={['mt-1 block text-[10px] opacity-75', msg.sender === 'user' ? 'text-slate-900' : 'text-slate-400'].join(' ')}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                <Bot size={14} />
              </div>
              <div className={['rounded-2xl px-4 py-3 text-xs', isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'].join(' ')}>
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
                  Gemini AI is analyzing your plant...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask about watering, pests, sunlight..."
            className={[
              'flex-1 rounded-2xl border px-4 py-3 text-xs outline-none transition',
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500'
                : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500',
            ].join(' ')}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
