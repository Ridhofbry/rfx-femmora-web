import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { generateGeminiContent } from '../config/firebase';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Halo! Aku Rexa. Asisten pribadi RFX Femmora. Tanyakan apa saja tentang layanan kami.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input; setInput(''); setMessages(prev => [...prev, { role: 'user', text: userMsg }]); setIsLoading(true);
    const prompt = `Kamu adalah Rexa, asisten virtual RFX Femmora. Gaya bahasa: Profesional tapi santai, singkat, dan membantu. Konteks: RFX (Visual/Web) & Femmora (Apps/Game). Pertanyaan: "${userMsg}"`;
    const aiResponseText = await generateGeminiContent(prompt);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }]); setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button (Glass Orb) */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-24 md:bottom-8 right-6 z-50 group">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-luxury-black/60 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(236,72,153,0.3)] animate-float">
           {isOpen ? <X className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
           {!isOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping"></span>}
        </div>
      </button>

      {/* Chat Window (Glass Panel) */}
      {isOpen && (
        <div className="fixed bottom-40 md:bottom-28 right-6 z-50 w-80 md:w-96 h-[500px] bg-luxury-black/90 backdrop-blur-2xl border border-glass-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-reveal origin-bottom-right">
          
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
             </div>
             <div>
                <h3 className="text-white font-bold text-sm tracking-wide">Rexa AI</h3>
                <p className="text-[10px] text-green-400 flex items-center gap-1">Online & Ready</p>
             </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-white text-black rounded-tr-none font-medium' 
                    : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'
                }`}>
                    {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-white/5 p-3 rounded-2xl rounded-tl-none w-12 flex justify-center gap-1"><span className="w-1 h-1 bg-white rounded-full animate-bounce"></span><span className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></span><span className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></span></div></div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
            <input className="flex-1 bg-transparent border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-600" placeholder="Ketik pertanyaan..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" disabled={isLoading || !input.trim()} className="p-3 rounded-lg bg-white text-black disabled:opacity-50 hover:bg-gray-200 transition-colors"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
