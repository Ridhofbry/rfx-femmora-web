import React, { useState } from 'react';
import { 
  Plus, X, Zap, Activity, ScanLine, LogOut, Image as ImageIcon 
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, APP_ID, generateGeminiContent } from '../config/firebase';

// ==========================================
// 1. KOMPONEN KECIL (DITARUH DI LUAR)
// ==========================================

const OnyxCard = ({ title, count, color, icon: Icon, onClick }) => (
  <div 
    onClick={() => { if (navigator.vibrate) navigator.vibrate(15); onClick(); }} 
    className="bg-[#111] active:bg-[#222] border border-[#333] p-5 rounded-2xl flex items-center justify-between transition-all active:scale-95 mb-4 cursor-pointer"
  >
    <div>
      <div className={`text-[10px] tracking-[0.2em] font-bold mb-1 uppercase ${color}`}>{title}</div>
      <div className="text-3xl font-black text-white font-mono">{count}</div>
    </div>
    <div className={`p-3 rounded-full bg-black border border-[#333] ${color}`}>
      <Icon size={20} />
    </div>
  </div>
);

const OnyxInput = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mb-2 block">{label}</label>
    <input className="w-full bg-black border border-[#333] text-white p-4 rounded-xl focus:border-cyan-500 outline-none font-mono text-sm placeholder:text-gray-700" {...props} />
  </div>
);

// ==========================================
// 2. FORMULIR INPUT (SAFE MODE)
// ==========================================

const OnyxForm = ({ view, onBack, onSubmit, loading }) => {
  const [form, setForm] = useState({ title: '', price: '', desc: '', imageUrl: '' });
  
  // Tentukan tipe
  const type = view === 'add_rfx' ? 'rfx' : view === 'add_fem' ? 'femmora' : 'gallery';
  const color = type === 'rfx' ? 'text-cyan-400' : type === 'femmora' ? 'text-pink-400' : 'text-yellow-400';

  const handleGenAI = async () => {
    if(!form.title) return alert("Isi Judul Dulu Boss!");
    
    const prompt = `Buat deskripsi marketing singkat, gaul, emoji on, untuk produk: ${form.title}. Konteks: RFX Femmora.`;
    
    try {
        const res = await generateGeminiContent(prompt);
        setForm(prev => ({...prev, desc: res}));
    } catch (error) {
        alert("Gagal konek ke otak Rexa.");
    }
  };

  return (
    // HAPUS CLASS 'animate-in' YANG BERPOTENSI BUG
    <div className="fixed inset-0 bg-black z-[200] flex flex-col font-body h-full w-full">
      
      {/* Header Form */}
      <div className="p-6 pt-12 flex items-center gap-4 border-b border-[#222] bg-black shrink-0">
        <button onClick={onBack} className="p-2 bg-[#111] rounded-lg text-white hover:bg-[#222] border border-[#333]">
           <X size={20}/>
        </button>
        <div className={`font-black text-xl tracking-wider uppercase ${color}`}>NEW {type}</div>
      </div>
      
      {/* Body Form */}
      <div className="p-6 flex-1 overflow-y-auto pb-32">
        <OnyxInput 
          label="CODENAME / TITLE" 
          placeholder="ex: Logo Esport / Netflix 1 Bulan" 
          value={form.title} 
          onChange={e=>setForm({...form, title: e.target.value})} 
        />
        
        {type !== 'gallery' && (
          <OnyxInput 
            label="PRICE (IDR)" 
            placeholder="ex: 50.000" 
            type="number" 
            value={form.price} 
            onChange={e=>setForm({...form, price: e.target.value})} 
          />
        )}
        
        <div className="mb-4">
           <div className="flex justify-between mb-2">
             <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">DESCRIPTION</label>
             {type !== 'gallery' && (
               <button onClick={handleGenAI} className="text-[10px] text-cyan-400 font-bold bg-cyan-900/20 border border-cyan-500/30 px-3 py-1 rounded hover:bg-cyan-900/50 transition-colors">
                 ✨ GENERATE AI
               </button>
             )}
           </div>
           <textarea 
             className="w-full bg-black border border-[#333] text-white p-4 rounded-xl focus:border-cyan-500 outline-none font-mono text-sm h-32 placeholder:text-gray-700 resize-none" 
             value={form.desc} 
             onChange={e=>setForm({...form, desc: e.target.value})} 
             placeholder="Deskripsi produk..." 
           />
        </div>

        <OnyxInput 
          label="IMAGE URL" 
          placeholder="https://..." 
          value={form.imageUrl} 
          onChange={e=>setForm({...form, imageUrl: e.target.value})} 
        />
        
        {/* Preview Image */}
        {form.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-[#333] h-40 bg-[#111]">
                <img 
                  src={form.imageUrl} 
                  className="w-full h-full object-cover opacity-70" 
                  onError={(e) => e.target.src='https://placehold.co/600x400/000000/FFF?text=Error+Loading'} 
                  alt="Preview"
                />
            </div>
        )}
      </div>

      {/* Footer / Tombol Submit */}
      <div className="p-6 bg-black border-t border-[#222] absolute bottom-0 left-0 right-0 z-10">
        <button 
          disabled={loading} 
          onClick={() => onSubmit({ ...form, type })} 
          className={`w-full ${loading ? 'bg-gray-800' : 'bg-white'} text-black font-black py-4 rounded-xl tracking-widest uppercase transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
        >
          {loading ? 'DEPLOYING...' : 'CONFIRM DEPLOY'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. KOMPONEN UTAMA
// ==========================================

const CommanderApp = ({ onClose, rfxItems, femmoraItems, galleryItems }) => {
  const [view, setView] = useState('dashboard'); // dashboard, add_rfx, add_fem, add_gallery
  const [loading, setLoading] = useState(false);

  // --- HAPTIC ENGINE ---
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(15);
  };

  // --- LOGIC TAMBAH DATA ---
  const handleAdd = async (data) => {
    triggerHaptic();
    setLoading(true);
    const mapColl = { 'rfx': 'rfx_services', 'femmora': 'femmora_products', 'gallery': 'admin_gallery' };
    
    try {
      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', mapColl[data.type]), { ...data, createdAt: serverTimestamp() });
      alert("SUCCESS COMMANDER! Item deployed.");
      setView('dashboard');
    } catch (e) { 
      alert("ERROR: " + e.message); 
    }
    setLoading(false);
  };

  // --- RENDER DASHBOARD ---
  if (view === 'dashboard') {
    return (
      <div className="fixed inset-0 bg-black z-[100] overflow-y-auto pb-20 font-body h-full w-full">
        {/* Header ala Sci-Fi */}
        <div className="p-6 pt-12 flex justify-between items-center border-b border-[#222] bg-black/90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyan-900/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
               <Zap className="text-cyan-400 w-5 h-5 animate-pulse" />
             </div>
             <div>
               <div className="text-white font-black tracking-tighter text-lg">RFX<span className="text-pink-500">CMD</span></div>
               <div className="text-[10px] text-green-500 tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> ONLINE
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-[#111] rounded-full text-gray-500 hover:text-red-500 transition-colors border border-[#333]">
             <LogOut size={20} />
          </button>
        </div>

        {/* Status Grid */}
        <div className="p-6">
          <div className="text-gray-500 text-[10px] tracking-[0.4em] mb-6 text-center">SYSTEM STATUS: NORMAL</div>
          
          <OnyxCard title="Visual Services" count={rfxItems.length} color="text-cyan-400" icon={Activity} onClick={() => setView('add_rfx')} />
          <OnyxCard title="Store Products" count={femmoraItems.length} color="text-pink-400" icon={ScanLine} onClick={() => setView('add_fem')} />
          <OnyxCard title="Evidence Gallery" count={galleryItems.length} color="text-yellow-400" icon={ImageIcon} onClick={() => setView('add_gallery')} />
        </div>

        {/* Quick Action Button */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-20">
           <button onClick={() => setView('add_rfx')} className="w-full bg-white text-black font-black py-5 rounded-2xl tracking-[0.2em] uppercase active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
             <Plus size={18} /> New Deploy
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER FORM INPUT ---
  return <OnyxForm view={view} onBack={() => setView('dashboard')} onSubmit={handleAdd} loading={loading} />;
};

export default CommanderApp;
