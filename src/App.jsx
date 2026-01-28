import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { Palette, Video, ShoppingCart, Smartphone, MessageCircle, ImageIcon, Edit, Plus, ShieldCheck, Zap, Heart } from 'lucide-react';

// Import Config & Components (Hasil kerja keras kita tadi!)
import { auth, db, APP_ID } from './config/firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatBot from './components/AIChatBot';
import ItemCard from './components/ItemCard';
import TestiCard from './components/TestiCard';
import GalleryCard from './components/GalleryCard';

// Import Modals
import DetailModal from './modals/DetailModal';
import LoginModal from './modals/LoginModal';
import AdminForm from './modals/AdminForm';
import UserReviewForm from './modals/UserReviewForm';
import EditHomeModal from './modals/EditHomeModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditHomeModal, setShowEditHomeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUserReviewForm, setShowUserReviewForm] = useState(false);
  
  // Data States
  const [rfxItems, setRfxItems] = useState([]);
  const [femmoraItems, setFemmoraItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]); 
  const [galleryItems, setGalleryItems] = useState([]); 
  const [homeContent, setHomeContent] = useState({
    story: "Awalnya kami berjalan sendiri-sendiri. RFX Visual fokus di Editing Video, Animasi & Website. Di sisi lain, Femmora Store menjadi andalan untuk kebutuhan Aplikasi Premium & Robux.",
    whyJoin: "Kami sadar, dunia kreatif dan hiburan itu saling melengkapi. Karena itulah RFX Femmora lahir. Satu tempat untuk mempercantik branding kamu, sekaligus menikmati hiburan premium tanpa ribet.",
    rfxImage: "https://images.unsplash.com/photo-1626785774573-4b7993143a4d?q=80&w=2070",
    femmoraImage: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000"
  });

  // --- 1. AUTH & DATA FETCHING ---
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Helper untuk listener Firestore
    const subscribe = (subColl, setter) => {
      const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', subColl), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snap) => setter(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    };

    const unsubRfx = subscribe('rfx_services', setRfxItems);
    const unsubFem = subscribe('femmora_products', setFemmoraItems);
    const unsubTesti = subscribe('public_reviews', setTestimonials);
    const unsubGallery = subscribe('admin_gallery', setGalleryItems);
    
    // Home Settings
    const unsubHome = onSnapshot(doc(db, 'artifacts', APP_ID, 'public', 'data', 'home_content', 'settings'), (doc) => {
      if (doc.exists()) setHomeContent(prev => ({...prev, ...doc.data()}));
    });

    return () => { unsubRfx(); unsubFem(); unsubTesti(); unsubGallery(); unsubHome(); };
  }, [user]);

  // --- 2. HANDLERS ---
  const handleAddItem = async (data) => {
    if (!user) return;
    const mapTypeToColl = {
      'rfx': 'rfx_services',
      'femmora': 'femmora_products',
      'gallery': 'admin_gallery',
      'user_review': 'public_reviews'
    };
    try { await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', mapTypeToColl[data.type]), { ...data, createdAt: serverTimestamp() }); } 
    catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (id, type) => {
    if (!confirm("Hapus item ini?")) return;
    const mapTypeToColl = {
      'rfx': 'rfx_services',
      'femmora': 'femmora_products',
      'gallery': 'admin_gallery',
      'user_review': 'public_reviews'
    };
    try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', mapTypeToColl[type], id)); } 
    catch (e) { console.error(e); }
  };

  const handleUpdateHome = async (data) => {
    if (!user) return;
    try { await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'home_content', 'settings'), data, { merge: true }); } 
    catch(e) { console.error(e); }
  };

  // --- 3. RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body selection:bg-pink-500/30 pb-32 md:pb-0 overflow-x-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onAdminClick={() => isAdminMode ? setIsAdminMode(false) : setShowLoginModal(true)} isAdminMode={isAdminMode} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-24 animate-pop">
            {/* Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 min-h-[600px] flex items-center justify-center p-6 md:p-12 shadow-2xl shadow-cyan-900/10">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay filter blur-sm scale-110" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-slate-900/50" />
              <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
                <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span></span>
                  <span className="text-xs font-bold text-cyan-200 tracking-widest uppercase font-rfx">Proudly Presenting</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
                  <span className="font-rfx block md:inline text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-700 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">RFX</span>
                  <span className="hidden md:inline mx-4 text-slate-800 font-thin select-none">&</span>
                  <span className="font-femmora block md:inline text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-600 filter drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">FEMMORA</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-300 mb-12 font-light leading-relaxed">Kolaborasi epik antara <strong className="text-cyan-400">Jasa Visual</strong> & <strong className="text-pink-400">Premium Apps Store</strong> terpercaya.</p>
                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                    <button onClick={() => setActiveTab('rfx')} className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold transition-all hover:scale-105 hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] flex items-center justify-center gap-3"><Palette className="w-6 h-6" /> Order Desain</button>
                    <button onClick={() => setActiveTab('femmora')} className="px-10 py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold transition-all hover:scale-105 hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] flex items-center justify-center gap-3"><ShoppingCart className="w-6 h-6" /> Beli Premium</button>
                </div>
              </div>
            </div>

            {/* Story & Why Join */}
            <div className="grid md:grid-cols-2 gap-12 items-center relative">
               <div className="order-2 md:order-1 space-y-8 bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm relative group">
                 {isAdminMode && <button onClick={() => setShowEditHomeModal(true)} className="absolute top-6 right-6 p-2 bg-yellow-500/20 text-yellow-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-500 hover:text-white flex items-center gap-2 text-xs font-bold"><Edit className="w-4 h-4" /> Edit</button>}
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

            {/* Features Grid */}
            <div className="bg-slate-900/40 rounded-[3rem] p-8 md:p-16 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div><div className="absolute bottom-0 left-0 p-32 bg-pink-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
              <div className="text-center max-w-2xl mx-auto mb-16 relative z-10"><h2 className="text-4xl font-bold text-white font-rfx mb-6">Kenapa Harus Kami?</h2><p className="text-slate-400 text-lg">Kami tidak hanya menjual, kami memberikan pengalaman terbaik.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">{[{ icon: ShieldCheck, color: 'text-green-400', title: "Terjamin Aman", desc: "Premium Apps & Robux 100% legal, anti-hold, dan bergaransi." }, { icon: Zap, color: 'text-yellow-400', title: "Proses Kilat", desc: "Pengerjaan visual tepat waktu, pengiriman akun/robux sat-set." }, { icon: Heart, color: 'text-red-400', title: "Pelayanan Ramah", desc: "Kami mengutamakan kepuasan dan kenyamanan komunikasi." }].map((feat, idx) => (<div key={idx} className="bg-slate-950/80 backdrop-blur p-8 rounded-3xl border border-slate-800 hover:border-slate-600 transition-all hover:-translate-y-2 hover:shadow-xl text-center group"><div className={`w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feat.color} shadow-lg`}><feat.icon className="w-8 h-8" /></div><h3 className="text-xl font-bold text-white mb-3 font-body">{feat.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p></div>))}</div>
            </div>
          </div>
        )}

        {/* TAB: RFX */}
        {activeTab === 'rfx' && (
          <div className="animate-pop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-8 gap-6">
              <div><div className="flex items-center gap-4 mb-3"><div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20 transform -rotate-6"><Palette className="text-white w-8 h-8" /></div><h2 className="text-5xl font-bold text-white font-rfx tracking-wide drop-shadow-lg">RFX Visual</h2></div><p className="text-slate-400 max-w-md text-lg ml-2">Video Editing, Motion Graphic & Web Statis.</p></div>
              {isAdminMode && <button onClick={() => setShowAddModal('rfx')} className="w-full md:w-auto px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"><Plus className="w-5 h-5" /> Tambah Jasa</button>}
            </div>
            {rfxItems.length === 0 ? (<div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><Video className="w-20 h-20 text-slate-700 mb-6" /><p className="text-slate-500 font-medium text-lg">Belum ada layanan visual yang diupload.</p>{isAdminMode && <p className="text-cyan-500 text-sm mt-3 animate-pulse font-bold">Yuk, upload portofolio pertamamu!</p>}</div>) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {rfxItems.map((item) => (<ItemCard key={item.id} item={item} isAdmin={isAdminMode} type="rfx" onClick={setSelectedItem} onDelete={(id) => handleDeleteItem(id, 'rfx')} />))}
                </div>
            )}
          </div>
        )}

        {/* TAB: FEMMORA */}
        {activeTab === 'femmora' && (
          <div className="animate-pop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-8 gap-6">
              <div><div className="flex items-center gap-4 mb-3"><div className="p-3 bg-pink-500 rounded-2xl shadow-lg shadow-pink-500/20 transform rotate-6"><ShoppingCart className="text-white w-8 h-8" /></div><h2 className="text-5xl font-bold text-white font-femmora drop-shadow-lg">Femmora Store</h2></div><p className="text-slate-400 max-w-md text-lg ml-2">Premium Apps (Spotify/Netflix) & Robux Aman.</p></div>
              {isAdminMode && <button onClick={() => setShowAddModal('femmora')} className="w-full md:w-auto px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20"><Plus className="w-5 h-5" /> Tambah Produk</button>}
            </div>
            {femmoraItems.length === 0 ? (<div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><Smartphone className="w-20 h-20 text-slate-700 mb-6" /><p className="text-slate-500 font-medium text-lg">Belum ada produk premium yang diupload.</p>{isAdminMode && <p className="text-pink-500 text-sm mt-3 animate-pulse font-bold">Mulai jualan sekarang!</p>}</div>) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {femmoraItems.map((item) => (<ItemCard key={item.id} item={item} isAdmin={isAdminMode} type="femmora" onClick={setSelectedItem} onDelete={(id) => handleDeleteItem(id, 'femmora')} />))}
                </div>
            )}
          </div>
        )}

        {/* TAB: TESTIMONI */}
        {activeTab === 'testimoni' && (
          <div className="animate-pop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-8 gap-6">
              <div><div className="flex items-center gap-4 mb-3"><div className="p-3 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/20 transform -rotate-3"><Star className="text-white w-8 h-8" /></div><h2 className="text-5xl font-bold text-white font-rfx drop-shadow-lg">Happy Clients</h2></div><p className="text-slate-400 text-lg ml-2">Apa kata mereka tentang layanan kami?</p></div>
              <div className="flex gap-2">
                <button onClick={() => setShowUserReviewForm(true)} className="w-full md:w-auto px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20"><Edit className="w-4 h-4" /> Tulis Ulasan</button>
                {isAdminMode && <button onClick={() => setShowAddModal('gallery')} className="w-full md:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"><Plus className="w-4 h-4" /> Add Galeri</button>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {testimonials.length === 0 ? (<div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800"><MessageCircle className="w-16 h-16 text-slate-700 mb-4" /><p className="text-slate-500 font-medium">Belum ada ulasan dari user.</p></div>) : (testimonials.map((item) => (<TestiCard key={item.id} item={item} isAdmin={isAdminMode} onDelete={(id) => handleDeleteItem(id, 'user_review')} />)))}
            </div>

            <div className="border-t border-slate-800 pt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-slate-800 p-2 rounded-lg"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                <h3 className="text-2xl font-bold text-white font-rfx">Galeri Real Testimoni & Bukti</h3>
              </div>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {galleryItems.map((item) => (
                  <GalleryCard key={item.id} item={item} isAdmin={isAdminMode} onDelete={(id) => handleDeleteItem(id, 'gallery')} />
                ))}
              </div>
              {galleryItems.length === 0 && <p className="text-slate-500 italic">Belum ada foto galeri.</p>}
            </div>
          </div>
        )}

      </main>

      <AIChatBot />
      <Footer />

      {/* RENDER MODALS */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} isRfx={activeTab === 'rfx'} />}
      {showUserReviewForm && <UserReviewForm onSubmit={handleAddItem} onClose={() => setShowUserReviewForm(false)} />}
      {showAddModal && <AdminForm type={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddItem} />}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={() => setIsAdminMode(true)} />}
      {showEditHomeModal && <EditHomeModal currentData={homeContent} onClose={() => setShowEditHomeModal(false)} onSubmit={handleUpdateHome} />}
    </div>
  );
}

// Komponen Star perlu diimport manual untuk Testimoni
import { Star } from 'lucide-react';
