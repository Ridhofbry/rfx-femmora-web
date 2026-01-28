import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { generateGeminiContent } from '../config/firebase'; // Import dari config baru

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Halo! Aku Rexa 🤖 asisten RFX Femmora. Ada yang bisa aku bantu? Mau bikin website atau beli app premium?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input; 
    setInput(''); 
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]); 
    setIsLoading(true);

    const prompt = `Kamu adalah Rexa, asisten virtual ramah dan gaul untuk RFX Femmora. RFX Visual: Jasa Editing Video, Animasi, dan Pembuatan Website Statis. Femmora Store: Menjual Aplikasi Premium (Netflix, Spotify, dll) dan Top Up Robux Roblox. Jawablah pertanyaan berikut dengan singkat, fun, dan bahasa Indonesia santai: "${userMsg}". Jika user minta ide, berikan ide kreatif. Jika user tanya harga, arahkan ke katalog atau WA admin.`;
    
    // Panggil fungsi dari config/firebase.js
    const aiResponseText = await generateGeminiContent(prompt);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }]); 
    setIsLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-24 md:bottom-8 right-4 z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-float group">
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
        {!isOpen && <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 md:bottom-24 right-4 z-50 w-80 md:w-96 h-[450px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-pop font-body">
          <div className="bg-slate-800/50 p-4 border-b border-white/5 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 p-[2px]"><div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center"><Bot className="w-6 h-6 text-pink-400" /></div></div>
             <div><h3 className="text-white font-bold font-rfx">Rexa AI</h3><p className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>{msg.text}</div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1"><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
            <input className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors" placeholder="Tanya Rexa..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-indigo-600 to-pink-600 p-2.5 rounded-xl text-white disabled:opacity-50 hover:opacity-90 transition-opacity"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
