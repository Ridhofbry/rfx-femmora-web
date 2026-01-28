import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Zap, Activity, ScanLine, LogOut, 
  Image as ImageIcon, ChevronRight, Home, Save, Upload 
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, APP_ID, generateGeminiContent } from '../config/firebase';

// ==========================================
// 1. KOMPONEN UI (Modular & Reusable)
// ==========================================

const OnyxCard = ({ title, count, color, icon: Icon, onClick }) => (
  <div 
    onClick={onClick} 
    className="bg-[#111] active:bg-[#222] border border-[#333] p-5 rounded-2xl flex items-center justify-between mb-4 cursor-pointer transition-colors"
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

const OnyxTextArea = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mb-2 block">{label}</label>
    <textarea className="w-full bg-black border border-[#333] text-white p-4 rounded-xl focus:border-cyan-500 outline-none font-mono text-sm placeholder:text-gray-700 h-32 resize-none" {...props} />
  </div>
);

// ==========================================
// 2. FORMULIR EDIT HOME (FITUR BARU)
// ==========================================

const OnyxHomeForm = ({ onBack }) => {
  const [form, setForm] = useState({ story: '', whyJoin: '', rfxImage: '', femmoraImage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch Data Saat Masuk Menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'home_content', 'settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) setForm(snap.data());
      } catch (e) { alert("Failed to fetch data"); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'home_content', 'settings'), form, { merge: true });
      alert("HOME LAYOUT UPDATED!");
      onBack();
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  if (loading) return <div className="fixed inset-0 bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING DATA...</div>;

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col font-body h-full w-full">
      <div className="p-6 pt-12 flex items-center gap-4 border-b border-[#222] bg-black shrink-0">
        <button onClick={onBack} className="p-2 bg-[#111] rounded-lg text-white hover:bg-[#222] border border-[#333]"><X size={20}/></button>
        <div className="font-black text-xl tracking-wider uppercase text-indigo-400">EDIT LAYOUT</div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto pb-32">
        <OnyxTextArea label="OUR STORY (PARAGRAF 1)" value={form.story} onChange={e=>setForm({...form, story: e.target.value})} />
        <OnyxTextArea label="WHY JOIN (PARAGRAF 2)" value={form.whyJoin} onChange={e=>setForm({...form, whyJoin: e.target.value})} />
        <OnyxInput label="RFX COVER IMAGE URL" value={form.rfxImage} onChange={e=>setForm({...form, rfxImage: e.target.value})} />
        <OnyxInput label="FEMMORA COVER IMAGE URL" value={form.femmoraImage} onChange={e=>setForm({...form, femmoraImage: e.target.value})} />
      </div>

      <div className="p-6 bg-black border-t border-[#222] absolute bottom-0 left-0 right-0 z-10">
        <button disabled={saving} onClick={handleSave} className="w-full bg-white text-black font-black py-4 rounded-xl tracking-widest uppercase active:scale-95 transition-transform flex items-center justify-center gap-2">
          {saving ? 'SAVING...' : <><Save size={18} /> SAVE CHANGES</>}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. FORMULIR TAMBAH ITEM (DENGAN UPLOAD FOTO)
// ==========================================

const OnyxForm = ({ view, onBack, onSubmit, loading }) => {
  const [form, setForm] = useState({ title: '', price: '', desc: '', imageUrl: '' });
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

  // --- LOGIC BASE64 CONVERTER ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Cek ukuran file (Batas aman Firestore ~700KB - 1MB)
      if (file.size > 800000) { 
         alert("⚠️ File terlalu besar! Maksimal 800KB agar database aman.");
         return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Hasil ini adalah string base64 panjang
        setForm(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col font-body h-full w-full">
      <div className="p-6 pt-12 flex items-center gap-4 border-b border-[#222] bg-black shrink-0">
        <button onClick={onBack} className="p-2 bg-[#111] rounded-lg text-white hover:bg-[#222] border border-[#333]"><X size={20}/></button>
        <div className={`font-black text-xl tracking-wider uppercase ${color}`}>NEW {type}</div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto pb-32">
        <OnyxInput label="CODENAME / TITLE" placeholder="ex: Logo Esport / Netflix 1 Bulan" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        {type !== 'gallery' && <OnyxInput label="PRICE (IDR)" placeholder="ex: 50.000" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />}
        
        <div className="mb-4">
           <div className="flex justify-between mb-2">
             <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">DESCRIPTION</label>
             {type !== 'gallery' && <button onClick={handleGenAI} className="text-[10px] text-cyan-400 font-bold bg-cyan-900/20 border border-cyan-500/30 px-3 py-1 rounded hover:bg-cyan-900/50 transition-colors">✨ GENERATE AI</button>}
           </div>
           <OnyxTextArea value={form.desc} onChange={e=>setForm({...form, desc: e.target.value})} placeholder="Deskripsi produk..." />
        </div>

        {/* --- BAGIAN UPLOAD FOTO --- */}
        <div className="mb-6">
            <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mb-2 block">IMAGE SOURCE</label>
            
            <div className="flex flex-col gap-3">
                {/* Input URL Manual (Backup) */}
                <input 
                    className="w-full bg-black border border-[#333] text-white p-4 rounded-xl focus:border-cyan-500 outline-none font-mono text-sm placeholder:text-gray-700"
                    placeholder="https://... OR Upload Photo below" 
                    value={form.imageUrl ? (form.imageUrl.startsWith('data:') ? 'Image Loaded (Base64)' : form.imageUrl) : ''}
                    onChange={e=>setForm({...form, imageUrl: e.target.value})} 
                />

                {/* Tombol Upload Keren */}
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="w-full bg-[#111] border border-dashed border-[#333] hover:border-cyan-500 text-gray-400 hover:text-cyan-400 p-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Upload size={18} />
                        <span className="text-xs font-bold tracking-widest">UPLOAD FROM GALLERY</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Preview Image */}
        {form.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-[#333] h-48 bg-[#111] relative">
                <img 
                    src={form.imageUrl} 
                    className="w-full h-full object-cover opacity-80" 
                    onError={(e) => e.target.src='https://placehold.co/600x400/000000/FFF?text=Error+Loading'} 
                    alt="Preview" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center text-[10px] text-gray-400 font-mono">
                    PREVIEW MODE
                </div>
            </div>
        )}
      </div>

      <div className="p-6 bg-black border-t border-[#222] absolute bottom-0 left-0 right-0 z-10">
        <button disabled={loading} onClick={() => onSubmit({ ...form, type })} className={`w-full ${loading ? 'bg-gray-800' : 'bg-white'} text-black font-black py-4 rounded-xl tracking-widest uppercase active:scale-95 transition-transform`}>
          {loading ? 'DEPLOYING...' : 'CONFIRM DEPLOY'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. KOMPONEN UTAMA (DASHBOARD)
// ==========================================

const CommanderApp = ({ onClose, rfxItems, femmoraItems, galleryItems }) => {
  const [view, setView] = useState('dashboard'); 
  const [loading, setLoading] = useState(false);

  const handleAdd = async (data) => {
    setLoading(true);
    const mapColl = { 'rfx': 'rfx_services', 'femmora': 'femmora_products', 'gallery': 'admin_gallery' };
    try {
      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', mapColl[data.type]), { ...data, createdAt: serverTimestamp() });
      alert("SUCCESS COMMANDER! Item deployed.");
      setView('dashboard');
    } catch (e) { alert("ERROR: " + e.message); }
    setLoading(false);
  };

  // --- HALAMAN DASHBOARD ---
  if (view === 'dashboard') {
    return (
      <div className="fixed inset-0 bg-black z-[100] overflow-y-auto pb-20 font-body h-full w-full">
        <div className="p-6 pt-12 flex justify-between items-center border-b border-[#222] bg-black/90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyan-900/20 rounded-lg flex items-center justify-center border border-cyan-500/30"><Zap className="text-cyan-400 w-5 h-5 animate-pulse" /></div>
             <div><div className="text-white font-black tracking-tighter text-lg">RFX<span className="text-pink-500">CMD</span></div><div className="text-[10px] text-green-500 tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> ONLINE</div></div>
          </div>
          <button onClick={onClose} className="p-2 bg-[#111] rounded-full text-gray-500 hover:text-red-500 transition-colors border border-[#333]"><LogOut size={20} /></button>
        </div>

        <div className="p-6">
          <div className="text-gray-500 text-[10px] tracking-[0.4em] mb-6 text-center">SYSTEM STATUS: NORMAL</div>
          <OnyxCard title="Visual Services" count={rfxItems.length} color="text-cyan-400" icon={Activity} onClick={() => setView('add_rfx')} />
          <OnyxCard title="Store Products" count={femmoraItems.length} color="text-pink-400" icon={ScanLine} onClick={() => setView('add_fem')} />
          <OnyxCard title="Evidence Gallery" count={galleryItems.length} color="text-yellow-400" icon={ImageIcon} onClick={() => setView('add_gallery')} />
          
          {/* KARTU EDIT HOME LAYOUT */}
          <OnyxCard title="Home Layout" count="EDIT" color="text-indigo-400" icon={Home} onClick={() => setView('edit_home')} />
        </div>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-20">
           <button onClick={() => setView('selection')} className="w-full bg-white text-black font-black py-5 rounded-2xl tracking-[0.2em] uppercase active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
             <Plus size={18} /> New Deploy
           </button>
        </div>
      </div>
    );
  }

  // --- HALAMAN SELEKSI ---
  if (view === 'selection') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150] flex flex-col justify-end">
        <div className="bg-[#0a0a0c] border-t border-[#333] rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-10">
          <div className="flex justify-between items-center mb-8">
            <div className="text-white font-black tracking-wider text-xl">SELECT ACTION</div>
            <button onClick={() => setView('dashboard')} className="p-2 bg-[#222] rounded-full text-white"><X size={20}/></button>
          </div>
          <div className="space-y-3">
            <button onClick={() => setView('add_rfx')} className="w-full p-4 bg-[#111] border border-cyan-500/30 rounded-xl flex items-center justify-between group active:bg-cyan-900/20"><span className="font-bold text-cyan-400 tracking-widest">VISUAL SERVICE</span> <ChevronRight className="text-cyan-400" /></button>
            <button onClick={() => setView('add_fem')} className="w-full p-4 bg-[#111] border border-pink-500/30 rounded-xl flex items-center justify-between group active:bg-pink-900/20"><span className="font-bold text-pink-400 tracking-widest">STORE PRODUCT</span> <ChevronRight className="text-pink-400" /></button>
            <button onClick={() => setView('add_gallery')} className="w-full p-4 bg-[#111] border border-yellow-500/30 rounded-xl flex items-center justify-between group active:bg-yellow-900/20"><span className="font-bold text-yellow-400 tracking-widest">GALLERY PROOF</span> <ChevronRight className="text-yellow-400" /></button>
            <button onClick={() => setView('edit_home')} className="w-full p-4 bg-[#111] border border-indigo-500/30 rounded-xl flex items-center justify-between group active:bg-indigo-900/20"><span className="font-bold text-indigo-400 tracking-widest">EDIT HOME PAGE</span> <ChevronRight className="text-indigo-400" /></button>
          </div>
        </div>
      </div>
    );
  }

  // --- ROUTING FORM ---
  if (view === 'edit_home') {
    return <OnyxHomeForm onBack={() => setView('dashboard')} />;
  }

  return <OnyxForm view={view} onBack={() => setView('dashboard')} onSubmit={handleAdd} loading={loading} />;
};

export default CommanderApp;
