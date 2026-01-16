import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { Palette, ShoppingCart, Star, Trash2, Plus, LayoutGrid, MessageCircle, LogIn, LogOut, Image as ImageIcon, Lock, Edit, Home, Bot, Send, Sparkles, X, Loader2, Gamepad2, Video, Smartphone } from 'lucide-react';

// --- KONFIGURASI FIREBASE KAMU (SUDAH DIISI) ---
const firebaseConfig = {
  apiKey: "AIzaSyBt2lZIbFHsiQB9TMsR3kxTBuXUVzTrLuA",
  authDomain: "rfx-femmora-web.firebaseapp.com",
  projectId: "rfx-femmora-web",
  storageBucket: "rfx-femmora-web.firebasestorage.app",
  messagingSenderId: "236566835727",
  appId: "1:236566835727:web:1101f1c7a7af4ddf74297a"
};

// --- API KEY GEMINI (SUDAH DIISI) ---
const GEMINI_API_KEY = "AIzaSyCY0V90M-qGf7ZOa3BFykcdg6hUO4b0xJw"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "rfx-femmora-production"; 

const generateGeminiContent = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI sedang error.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal menghubungi AI.";
  }
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Russo+One&display=swap');
    .font-rfx { font-family: 'Russo One', sans-serif; }
    .font-femmora { font-family: 'Fredoka', sans-serif; }
    .font-body { font-family: 'Nunito', sans-serif; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.9) translateY(20px); }
      50% { opacity: 1; transform: scale(1.02) translateY(-5px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-pop { animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    .animate-float { animation: float 3s ease-in-out infinite; }
  `}</style>
);

const BrandLogo = ({ onClick }) => (
  <div className="relative group cursor-pointer select-none transform transition-transform duration-300 hover:scale-105 flex items-center gap-2" onClick={onClick}>
    <div className="bg-gradient-to-br from-cyan-500 to-pink-500 p-1.5 rounded-lg shadow-lg">
       <LayoutGrid className="text-white w-5 h-5" />
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-rfx text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-sm filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">RFX</span>
      <span className="font-femmora font-bold text-xl text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-600 drop-shadow-sm filter drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]">FEMMORA</span>
    </div>
  </div>
);

const Navbar = ({ activeTab, setActiveTab, onAdminClick, isAdminMode }) => (
  <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 font-body shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <BrandLogo onClick={() => setActiveTab('home')} />
        <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <button onClick={() => setActiveTab('home')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'home' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>
            <Home className={`w-4 h-4 mr-2 ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-500'}`} /> Home
          </button>
          <button onClick={() => setActiveTab('rfx')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'rfx' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>
            <Palette className={`w-4 h-4 mr-2 ${activeTab === 'rfx' ? 'text-cyan-400' : 'text-slate-500'}`} /> RFX Visual
          </button>
          <button onClick={() => setActiveTab('femmora')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'femmora' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>
            <ShoppingCart className={`w-4 h-4 mr-2 ${activeTab === 'femmora' ? 'text-pink-400' : 'text-slate-500'}`} /> Femmora Store
          </button>
          <button onClick={() => setActiveTab('testimoni')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'testimoni' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>
            <Star className={`w-4 h-4 mr-2 ${activeTab === 'testimoni' ? 'text-yellow-400' : 'text-slate-500'}`} /> Testimoni
          </button>
        </div>
        <div>
           <button onClick={onAdminClick} className={`p-2.5 rounded-lg transition-all duration-300 border ${isAdminMode ? 'bg-gradient-to-r from-red-500 to-orange-500 border-red-400 text-white shadow-lg shadow-red-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`} title={isAdminMode ? "Keluar Admin" : "Masuk Admin"}>
             {isAdminMode ? <LogOut className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
           </button>
        </div>
      </div>
    </div>
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex justify-around">
         <button onClick={() => setActiveTab('home')} className={`p-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-500'}`}><Home className="w-5 h-5" /></button>
         <button onClick={() => setActiveTab('rfx')} className={`p-3 rounded-xl transition-all ${activeTab === 'rfx' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-gray-500'}`}><Palette className="w-5 h-5" /></button>
         <button onClick={() => setActiveTab('femmora')} className={`p-3 rounded-xl transition-all ${activeTab === 'femmora' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30' : 'text-gray-500'}`}><ShoppingCart className="w-5 h-5" /></button>
         <button onClick={() => setActiveTab('testimoni')} className={`p-3 rounded-xl transition-all ${activeTab === 'testimoni' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30' : 'text-gray-500'}`}><Star className="w-5 h-5" /></button>
    </div>
  </nav>
);

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
    const userMsg = input; setInput(''); setMessages(prev => [...prev, { role: 'user', text: userMsg }]); setIsLoading(true);
    const prompt = `Kamu adalah Rexa, asisten virtual ramah dan gaul untuk RFX Femmora. RFX Visual: Jasa Editing Video, Animasi, dan Pembuatan Website Statis. Femmora Store: Menjual Aplikasi Premium (Netflix, Spotify, dll) dan Top Up Robux Roblox. Jawablah pertanyaan berikut dengan singkat, fun, dan bahasa Indonesia santai: "${userMsg}". Jika user minta ide, berikan ide kreatif. Jika user tanya harga, arahkan ke katalog atau WA admin.`;
    const aiResponseText = await generateGeminiContent(prompt);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }]); setIsLoading(false);
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

const AdminForm = ({ type, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerateDesc = async () => {
    if (!title) { alert("Isi nama produk dulu ya!"); return; }
    setIsGenerating(true);
    let contextType = '';
    if (type === 'rfx') contextType = 'Jasa Editing Video / Animasi / Website Statis';
    else if (type === 'femmora') contextType = 'Aplikasi Premium (Spotify/Netflix) / Robux Roblox';
    else contextType = 'Testimoni Customer';
    const prompt = `Buatlah deskripsi marketing yang singkat, menarik, gaul, dan persuasif (bahasa Indonesia) untuk: Nama: ${title}. Harga: ${price || 'Terjangkau'}. Kategori: ${contextType}. Konteks: Dijual di RFX Femmora. Gunakan emoji yang relevan. Jangan terlalu panjang, maksimal 3 kalimat.`;
    const result = await generateGeminiContent(prompt);
    setDesc(result); setIsGenerating(false);
  };
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ title, price, desc, imageUrl, type }); onClose(); };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-body animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center border-b border-slate-800 pb-4"><Plus className="w-6 h-6 mr-3 text-cyan-400 p-1 bg-cyan-400/10 rounded-lg" /> Tambah {type === 'testimoni' ? 'Testimoni' : 'Konten Baru'}</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Nama / Judul</label><input required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'testimoni' ? "Nama Client" : "Contoh: Jasa Web Portofolio / Robux 100"} /></div>
          {type !== 'testimoni' && (<div><label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Harga (IDR)</label><input required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Contoh: 50.000" /></div>)}
          <div>
            <div className="flex justify-between items-center mb-2"><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{type === 'testimoni' ? 'Isi Review' : 'Deskripsi'}</label><button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-md text-white font-bold flex items-center gap-1 hover:opacity-80 transition-opacity">{isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} {isGenerating ? 'Generating...' : 'Buat Deskripsi Otomatis'}</button></div>
            <textarea required rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600 resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Jelaskan detailnya... atau klik tombol AI di atas!" />
          </div>
          <div><label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Link Gambar</label><div className="flex gap-2"><input required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /><div className="bg-slate-800 p-3 rounded-xl flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 text-gray-400" /></div></div></div>
          <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300 hover:bg-slate-700 font-semibold transition-colors">Batal</button><button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all">Upload</button></div>
        </form>
      </div>
    </div>
  );
};

const LoginModal = ({ onClose, onSuccess }) => {
  const [pass, setPass] = useState(''); const [error, setError] = useState(false);
  const handleLogin = (e) => { e.preventDefault(); if (pass === '19201802') { onSuccess(); onClose(); } else { setError(true); setPass(''); } };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-cyan-400" /></div>
        <h3 className="text-xl font-bold text-white mb-2">Admin Access</h3>
        <p className="text-slate-400 text-sm mb-6">Masukkan password untuk mengelola konten.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" autoFocus className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-center text-white focus:outline-none focus:border-cyan-500 tracking-widest text-lg`} placeholder="••••••••" value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }} />
          {error && <p className="text-red-400 text-xs font-bold">Password salah!</p>}
          <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white font-bold">Batal</button><button type="submit" className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/20">Masuk</button></div>
        </form>
      </div>
    </div>
  );
};

const EditHomeModal = ({ currentData, onSubmit, onClose }) => {
  const [story, setStory] = useState(currentData?.story || ''); const [whyJoin, setWhyJoin] = useState(currentData?.whyJoin || ''); const [rfxImage, setRfxImage] = useState(currentData?.rfxImage || ''); const [femmoraImage, setFemmoraImage] = useState(currentData?.femmoraImage || '');
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ story, whyJoin, rfxImage, femmoraImage }); onClose(); };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-body animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center border-b border-slate-800 pb-4"><Edit className="w-5 h-5 mr-3 text-yellow-400" /> Edit Konten Home</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2"><label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Cerita (Paragraf 1)</label><textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-24 focus:border-cyan-500 outline-none" value={story} onChange={e => setStory(e.target.value)} /></div>
             <div className="col-span-2"><label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Alasan (Paragraf 2)</label><textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-24 focus:border-cyan-500 outline-none" value={whyJoin} onChange={e => setWhyJoin(e.target.value)} /></div>
             <div><label className="block text-xs font-semibold text-cyan-400 mb-2 uppercase">URL Foto RFX (Kiri/Atas)</label><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none text-xs" value={rfxImage} onChange={e => setRfxImage(e.target.value)} placeholder="https://..." /></div>
             <div><label className="block text-xs font-semibold text-pink-400 mb-2 uppercase">URL Foto Femmora (Kanan/Bawah)</label><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none text-xs" value={femmoraImage} onChange={e => setFemmoraImage(e.target.value)} placeholder="https://..." /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-400">Batal</button><button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold">Simpan Perubahan</button></div>
        </form>
      </div>
    </div>
  );
};

const ItemCard = ({ item, onDelete, isAdmin, type }) => {
  const isRfx = type === 'rfx'; const borderColor = isRfx ? 'group-hover:border-cyan-500/50' : 'group-hover:border-pink-500/50'; const shadowColor = isRfx ? 'group-hover:shadow-cyan-500/20' : 'group-hover:shadow-pink-500/20';
  const handleOrder = () => { const phone = '6288989100539'; const text = encodeURIComponent(`Halo Admin RFX Femmora, saya ingin order: *${item.title}* seharga IDR ${item.price}. Mohon infonya.`); window.open(`https://wa.me/${phone}?text=${text}`, '_blank'); };
  return (
    <div className={`font-body group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 transition-all duration-500 hover:-translate-y-2 ${borderColor} hover:shadow-2xl ${shadowColor} flex flex-col h-full`}>
      {isAdmin && <button onClick={() => onDelete(item.id)} className="absolute top-3 right-3 z-20 bg-red-500/90 hover:bg-red-600 p-2.5 rounded-xl text-white backdrop-blur-sm shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"><Trash2 className="w-4 h-4" /></button>}
      <div className="aspect-[4/5] relative overflow-hidden bg-slate-950">
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 z-10`} />
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.src = 'https://placehold.co/400x500/1e293b/white?text=No+Image'; }} />
        <div className="absolute top-3 left-3 z-10"><div className={`px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-xl ${isRfx ? 'bg-cyan-900/80 text-cyan-200' : 'bg-pink-900/80 text-pink-200'}`}>IDR {item.price}</div></div>
      </div>
      <div className="p-5 flex flex-col flex-1 relative z-20 -mt-12">
        <div className="bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl flex-1 flex flex-col hover:bg-slate-800 transition-colors">
          <h3 className={`text-lg font-bold text-white mb-2 leading-tight ${isRfx ? 'font-rfx tracking-wide' : 'font-femmora tracking-normal'}`}>{item.title}</h3>
          <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1 font-light leading-relaxed">{item.desc}</p>
          <button onClick={handleOrder} className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden ${isRfx ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'}`}>
            <span className="relative z-10 flex items-center gap-2"><MessageCircle className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" /> Order via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TestiCard = ({ item, onDelete, isAdmin }) => (
  <div className="font-body relative bg-slate-900/60 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 group">
     {isAdmin && <button onClick={() => onDelete(item.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
    <div className="flex items-center gap-4 mb-6">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 p-[2px] shadow-lg shrink-0"><img src={item.imageUrl} className="w-full h-full rounded-full object-cover bg-slate-900 border-2 border-slate-900" alt="user" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=User&background=random'} /></div>
      <div><h4 className="text-white font-bold text-lg font-femmora tracking-wide">{item.title}</h4><div className="flex text-yellow-400 mt-1 gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}</div></div>
    </div>
    <div className="relative"><span className="absolute -top-4 -left-2 text-6xl text-slate-800 font-serif opacity-50 z-0">"</span><p className="text-slate-300 text-base leading-relaxed relative z-10 pl-2 italic font-light">{item.desc}</p></div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditHomeModal, setShowEditHomeModal] = useState(false);
  const [rfxItems, setRfxItems] = useState([]);
  const [femmoraItems, setFemmoraItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [homeContent, setHomeContent] = useState({
    story: "Awalnya kami berjalan sendiri-sendiri. RFX Visual fokus di Editing Video, Animasi & Website. Di sisi lain, Femmora Store menjadi andalan untuk kebutuhan Aplikasi Premium & Robux.",
    whyJoin: "Kami sadar, dunia kreatif dan hiburan itu saling melengkapi. Karena itulah RFX Femmora lahir. Satu tempat untuk mempercantik branding kamu, sekaligus menikmati hiburan premium tanpa ribet.",
    rfxImage: "https://images.unsplash.com/photo-1626785774573-4b7993143a4d?q=80&w=2070",
    femmoraImage: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000"
  });

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const qRfx = query(collection(db, 'artifacts', appId, 'public', 'data', 'rfx_services'), orderBy('createdAt', 'desc'));
    const unsubRfx = onSnapshot(qRfx, (snap) => setRfxItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qFem = query(collection(db, 'artifacts', appId, 'public', 'data', 'femmora_products'), orderBy('createdAt', 'desc'));
    const unsubFem = onSnapshot(qFem, (snap) => setFemmoraItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qTesti = query(collection(db, 'artifacts', appId, 'public', 'data', 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubTesti = onSnapshot(qTesti, (snap) => setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const homeDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'home_content', 'settings');
    const unsubHome = onSnapshot(homeDocRef, (doc) => { if (doc.exists()) { setHomeContent(prev => ({...prev, ...doc.data()})); } });
    return () => { unsubRfx(); unsubFem(); unsubTesti(); unsubHome(); };
  }, [user]);

  const handleAddItem = async (data) => { if (!user) return; let collectionName = data.type === 'rfx' ? 'rfx_services' : data.type === 'femmora' ? 'femmora_products' : 'testimonials'; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), { ...data, createdAt: serverTimestamp() }); } catch (e) { console.error(e); } };
  const handleDeleteItem = async (id, type) => { if (!confirm("Hapus item ini?")) return; let collectionName = type === 'rfx' ? 'rfx_services' : type === 'femmora' ? 'femmora_products' : 'testimonials'; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id)); } catch (e) { console.error(e); } };
  const handleUpdateHome = async (data) => { if (!user) return; try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'home_content', 'settings'), data, { merge: true }); } catch(e) { console.error(e); } };
  const handleAdminToggle = () => { if (isAdminMode) { setIsAdminMode(false); } else { setShowLoginModal(true); } };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body selection:bg-pink-500/30 pb-32 md:pb-0 overflow-x-hidden">
      <GlobalStyles />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onAdminClick={handleAdminToggle} isAdminMode={isAdminMode} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <div className="space-y-24 animate-pop">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 min-h-[600px] flex items-center justify-center p-6 md:p-12 shadow-2xl shadow-cyan-900/10">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay filter blur-sm scale-110" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-slate-900/50" />
              <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
                <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl transform hover:scale-105 transition-transform duration-300"><span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span></span><span className="text-xs font-bold text-cyan-200 tracking-widest uppercase font-rfx">Official Hub v2.0</span></div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
                  <span className="font-rfx block md:inline text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-700 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">RFX</span>
                  <span className="hidden md:inline mx-4 text-slate-800 font-thin select-none">&</span>
                  <span className="font-femmora block md:inline text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-600 filter drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">FEMMORA</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-300 mb-12 font-light leading-relaxed">Kolaborasi epik antara <strong className="text-cyan-400">Jasa Visual</strong> & <strong className="text-pink-400">Premium Apps Store</strong> terpercaya.</p>
                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"><button onClick={() => setActiveTab('rfx')} className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold transition-all hover:scale-105 hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] flex items-center justify-center gap-3"><Palette className="w-6 h-6" /> Order Desain</button><button onClick={() => setActiveTab('femmora')} className="px-10 py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold transition-all hover:scale-105 hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] flex items-center justify-center gap-3"><ShoppingCart className="w-6 h-6" /> Beli Premium</button></div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center relative">
               <div className="order-2 md:order-1 space-y-8 bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm relative group">
                 {isAdminMode && <button onClick={() => setShowEditHomeModal(true)} className="absolute top-6 right-6 p-2 bg-yellow-500/20 text-yellow-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-500 hover:text-white flex items-center gap-2 text-xs font-bold"><Edit className="w-4 h-4" /> Edit Konten & Foto</button>}
                 <h2 className="text-4xl md:text-5xl font-bold text-white font-rfx">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">Story</span></h2>
                 <p className="text-slate-300 leading-loose text-lg font-light">{homeContent.story}</p>
                 <div className="h-px bg-slate-800 w-full" />
                 <p className="text-slate-300 leading-loose text-lg font-light"><strong className="text-white block mb-2 font-femmora text-xl">Kenapa bergabung?</strong>{homeContent.whyJoin}</p>
               </div>
               <div className="order-1 md:order-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-6 mt-12"><div className="aspect-[4/5] rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden relative group shadow-2xl"><img src={homeContent.rfxImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Design" /><div className="absolute inset-0 bg-cyan-900/40 mix-blend-color" /><div className="absolute bottom-4 left-4 font-rfx text-4xl text-white/20">RFX</div></div></div>
                      <div className="space-y-6"><div className="aspect-[4/5] rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden relative group shadow-2xl"><img src={homeContent.femmoraImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gaming" /><div className="absolute inset-0 bg-pink-900/40 mix-blend-color" /><div className="absolute bottom-4 left-4 font-femmora text-4xl text-white/20">FEM</div></div></div>
                  </div>
               </div>
            </div>
            <div className="bg-slate-900/40 rounded-[3rem] p-8 md:p-16 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div><div className="absolute bottom-0 left-0 p-32 bg-pink-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
              <div className="text-center max-w-2xl mx-auto mb-16 relative z-10"><h2 className="text-4xl font-bold text-white font-rfx mb-6">Kenapa Harus Kami?</h2><p className="text-slate-400 text-lg">Kami tidak hanya menjual, kami memberikan pengalaman terbaik.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">{[{ icon: ShieldCheck, color: 'text-green-400', title: "Terjamin Aman", desc: "Premium Apps & Robux 100% legal, anti-hold, dan bergaransi." }, { icon: Zap, color: 'text-yellow-400', title: "Proses Kilat", desc: "Pengerjaan visual tepat waktu, pengiriman akun/robux sat-set." }, { icon: Heart, color: 'text-red-400', title: "Pelayanan Ramah", desc: "Kami mengutamakan kepuasan dan kenyamanan komunikasi." }].map((feat, idx) => (<div key={idx} className="bg-slate-950/80 backdrop-blur p-8 rounded-3xl border border-slate-800 hover:border-slate-600 transition-all hover:-translate-y-2 hover:shadow-xl text-center group"><div className={`w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feat.color} shadow-lg`}><feat.icon className="w-8 h-8" /></div><h3 className="text-xl font-bold text-white mb-3 font-body">{feat.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p></div>))}</div>
            </div>
          </div>
        )}
        {activeTab === 'rfx' && (
          <div className="animate-pop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-8 gap-6">
              <div><div className="flex items-center gap-4 mb-3"><div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20 transform -rotate-6"><Palette className="text-white w-8 h-8" /></div><h2 className="text-5xl font-bold text-white font-rfx tracking-wide drop-shadow-lg">RFX Visual</h2></div><p className="text-slate-400 max-w-md text-lg ml-2">Video Editing, Motion Graphic & Web Statis.</p></div>
              {isAdminMode && <button onClick={() => setShowAddModal('rfx')} className="w-full md:w-auto px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"><Plus className="w-5 h-5" /> Tambah Jasa</button>}
            </div>
            {rfxItems.length === 0 ? (<div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><Video className="w-20 h-20 text-slate-700 mb-6" /><p className="text-slate-500 font-medium text-lg">Belum ada layanan visual yang diupload.</p>{isAdminMode && <p className="text-cyan-500 text-sm mt-3 animate-pulse font-bold">Yuk, upload portofolio pertamamu!</p>}</div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">{rfxItems.map((item) => (<ItemCard key={item.id} item={item} isAdmin={isAdminMode} type="rfx" onDelete={(id) => handleDeleteItem(id, 'rfx')} />))}</div>)}
          </div>
        )}
        {activeTab === 'femmora' && (
          <div className="animate-pop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-8 gap-6">
              <div><div className="flex items-center gap-4 mb-3"><div className="p-3 bg-pink-500 rounded-2xl shadow-lg shadow-pink-500/20 transform rotate-6"><ShoppingCart className="text-white w-8 h-8" /></div><h2 className="text-5xl font-bold text-white font-femmora drop-shadow-lg">Femmora Store</h2></div><p className="text-slate-400 max-w-md text-lg ml-2">Premium Apps (Spotify/Netflix) & Robux Aman.</p></div>
              {isAdminMode && <button onClick={() => setShowAddModal('femmora')} className="w-full md:w-auto px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20"><Plus className="w-5 h-5" /> Tambah Produk</button>}
            </div>
            {femmoraItems.length === 0 ? (<div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><Smartphone className="w-20 h-20 text-slate-700 mb-6" /><p className="text-slate-500 font-medium text-lg">Belum ada produk premium yang diupload.</p>{isAdminMode && <p className="text-pink-500 text-sm mt-3 animate-pulse font-bold">Mulai jualan sekarang!</p>}</div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">{femmoraItems.map((item) => (<ItemCard key={item.id} item={item} isAdmin={isAdminMode} type="femmora" onDelete={(id) => handleDeleteItem(id, 'femmora')} />))}</div>)}
          </div>
        )}
        {activeTab === 'testimoni' && (
          <div className="animate-pop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-8 gap-6">
              <div><div className="flex items-center gap-4 mb-3"><div className="p-3 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/20 transform -rotate-3"><Star className="text-white w-8 h-8" /></div><h2 className="text-5xl font-bold text-white font-rfx drop-shadow-lg">Happy Clients</h2></div><p className="text-slate-400 text-lg ml-2">Bukti nyata kepuasan pelanggan.</p></div>
              {isAdminMode && <button onClick={() => setShowAddModal('testimoni')} className="w-full md:w-auto px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"><Plus className="w-5 h-5" /> Tambah Review</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.length === 0 ? (<div className="col-span-full flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><MessageCircle className="w-20 h-20 text-slate-700 mb-6" /><p className="text-slate-500 font-medium text-lg">Belum ada testimoni.</p></div>) : (testimonials.map((item) => (<TestiCard key={item.id} item={item} isAdmin={isAdminMode} onDelete={(id) => handleDeleteItem(id, 'testimoni')} />)))}
            </div>
          </div>
        )}
      </main>
      <AIChatBot />
      <footer className="border-t border-slate-800 mt-32 bg-slate-950 py-16 font-body">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6"><div className="bg-gradient-to-br from-cyan-500 to-pink-500 p-2 rounded-xl shadow-lg"><LayoutGrid className="text-white w-5 h-5" /></div><h2 className="text-2xl font-bold text-white tracking-wide">RFX <span className="font-femmora text-pink-500">FEMMORA</span></h2></div>
          <p className="text-slate-500 text-sm mb-10 max-w-md mx-auto leading-relaxed">Partner terbaikmu dalam mewujudkan visual impian dan menikmati hiburan premium tanpa rasa was-was.</p>
          <div className="flex justify-center gap-10 text-slate-400 text-sm font-bold tracking-wide"><a href="#" className="hover:text-cyan-400 transition-colors transform hover:scale-110">Instagram</a><a href="#" className="hover:text-pink-400 transition-colors transform hover:scale-110">WhatsApp</a><a href="#" className="hover:text-indigo-400 transition-colors transform hover:scale-110">Discord</a></div>
          <p className="text-slate-800 text-xs mt-16 font-semibold">© 2026 RFX Femmora Collaboration. All rights reserved.</p>
        </div>
      </footer>
      {showAddModal && <AdminForm type={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddItem} />}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={() => setIsAdminMode(true)} />}
      {showEditHomeModal && <EditHomeModal currentData={homeContent} onClose={() => setShowEditHomeModal(false)} onSubmit={handleUpdateHome} />}
    </div>
  );
}
