import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Info, ChevronRight, Hash } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ciao! Sono l\'Assistente Intelligente di Ink&Print By Denise. Come posso aiutarti oggi? Posso aiutarti a trovare il toner corretto, verificare la compatibilità o tracciare un ordine.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages.slice(1) })
      });
      
      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Mi dispiace, si è verificato un errore. Riprova più tardi." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Errore di connessione. Controlla la tua rete." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Toner per HP LaserJet 1018', prompt: 'Cerco toner per HP LaserJet 1018' },
    { label: 'Tracking Ordine', prompt: 'Come posso tracciare il mio ordine?' },
    { label: 'Contatta Assistenza', prompt: 'Come posso contattare l\'assistenza?' }
  ];

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[90vw] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-brand-dark p-6 text-white flex justify-between items-center bg-blue-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Assistente Ink&Print By Denise</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-blue-100 uppercase font-bold tracking-widest">Sempre Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-slate-200'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl bg-white text-blue-600 border border-slate-200 flex items-center justify-center shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">L'assistente sta scrivendo...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={12} className="text-blue-500" /> Domande Frequenti
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => {
                        setInput(action.prompt);
                        const pseudoEvent = { preventDefault: () => {} } as React.FormEvent;
                        // Trigger send after tiny delay to ensure state update
                        setTimeout(() => handleSend(pseudoEvent), 10);
                      }}
                      className="text-[11px] font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 group"
                    >
                      <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Scrivi qui la tua domanda..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300'}`}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-3 text-center text-[10px] text-slate-400 font-medium tracking-tight">
                AI powered by <span className="font-bold text-blue-500">Gemini 3.0</span>. Ink&Print By Denise Support.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 overflow-hidden relative group ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-blue-600'}`}
      >
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="text-white" size={28} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full" />
          </div>
        )}
        {/* Shine effect */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 group-hover:h-full transition-all duration-300 pointer-events-none" />
      </button>
    </div>
  );
};
