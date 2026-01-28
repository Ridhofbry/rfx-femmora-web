import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { Palette, Video, ShoppingCart, Smartphone, MessageCircle, ImageIcon, Edit, Plus, ShieldCheck, Zap, Heart, Star } from 'lucide-react';

// Import Config & Components
import { auth, db, APP_ID } from './config/firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatBot from './components/AIChatBot';
import ItemCard from './components/ItemCard';
import TestiCard from './components/TestiCard';
import GalleryCard from './components/GalleryCard';
import CommanderApp from './components/CommanderApp'; // Pastikan ini ada

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
  const [isCommanderMode, setIsCommanderMode] = useState(false); // State untuk Mode HP
  
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
    const subscribe = (subColl, setter) => {
      const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', subColl), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snap) => setter(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    };
    const unsubRfx = subscribe('rfx_services', setRfxItems);
    const unsubFem = subscribe('femmora_products', setFemmoraItems);
    const unsubTesti = subscribe('public_reviews', setTestimonials);
    const unsubGallery = subscribe('admin_gallery', setGalleryItems);
    const unsubHome = onSnapshot(doc(db, 'artifacts', APP_ID, 'public', 'data', 'home_content', 'settings'), (doc) => {
      if (doc.exists()) setHomeContent(prev => ({...prev, ...doc.data()}));
    });
    return () => { unsubRfx(); unsubFem(); unsubTesti(); unsubGallery(); unsubHome(); };
  }, [user]);

  // --- 2. HANDLERS ---
  const handleAddItem = async (data) => {
    if (!user) return;
    const mapTypeToColl = { 'rfx': 'rfx_services', 'femmora': 'femmora_products', 'gallery': 'admin_gallery', 'user_review': 'public_reviews' };
    try { await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', mapTypeToColl[data.type]), { ...data, createdAt: serverTimestamp() }); } catch (e) { console.error(e); }
  };
  const handleDeleteItem = async (id, type) => {
    if (!confirm("Hapus item ini?")) return;
    const mapTypeToColl = { 'rfx': 'rfx_services', 'femmora': 'femmora_products', 'gallery': 'admin_gallery', 'user_review': 'public_reviews' };
    try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', mapTypeToColl[type], id)); } catch (e) { console.error(e); }
  };
  const handleUpdateHome = async (data) => {
    if (!user) return;
    try { await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'home_content', 'settings'), data, { merge: true }); } catch(e) { console.error(e); }
  };

  // --- 3. RENDER ---
  return (
    <div className="min-h-screen bg-luxury-black text-slate-200 font-body selection:bg-rfx-primary/30 pb-32 md:pb-0 overflow-x-hidden">
      
      {/* --- COMMANDER APP (Overlay Hitam untuk HP) --- */}
      {isCommanderMode && (
         <CommanderApp 
            onClose={() => setIsCommanderMode(false)} 
            rfxItems={rfxItems} 
            femmoraItems={femmoraItems} 
            galleryItems={galleryItems} 
         />
      )}

      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        
        {/* --- HERO SECTION --- */}
        {activeTab === 'home' && (
          <div className="space-y-32 animate-pop pt-10">
            {/* Main Title Area */}
            <div className="text-center relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[120px] -z-10 animate-glow" />
               <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-6 relative z-10">
                 <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-rfx">RFX</span>
                 <span className="mx-2 md:mx-6 text-2xl md:text-4xl text-rfx-primary font-serif italic align-middle">&</span>
                 <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-femmora">FEM</span>
               </h1>
               <p className="max-w-xl mx-auto text-muted-text text-lg md:text-xl font-light tracking-wide leading-relaxed mb-12">
                 Sinergi antara <span className="text-rfx-primary font-semibold">Seni Visual</span> dan <span className="text-fem-primary font-semibold">Hiburan Digital</span>. Eksklusif untuk mereka yang menghargai kualitas.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => setActiveTab('rfx')} className="px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors rounded-sm">Visual Services</button>
                  <button onClick={() => setActiveTab('femmora')} className="px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-colors rounded-sm backdrop-blur-md">Femmora Store</button>
               </div>
            </div>

            {/* Story Section */}
            <div className="grid md:grid-cols-2 gap-16 items-start relative border-t border-glass-border pt-20">
               <div className="space-y-8 relative group">
                 {isAdminMode && <button onClick={() => setShowEditHomeModal(true)} className="text-xs text-gold-accent border border-gold-accent/30 px-3 py-1 rounded hover:bg-gold-accent hover:text-black transition-colors flex items-center gap-2"><Edit className="w-3 h-3" /> EDIT CONTENT</button>}
                 <div className="text-5xl md:text-6xl font-rfx text-white leading-none">
                    Define Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rfx-primary to-purple-500">Identity.</span>
                 </div>
                 <p className="text-silver-text text-lg leading-loose font-light opacity-80">{homeContent.story}</p>
                 <div className="w-16 h-1 bg-rfx-primary/50" />
                 <p className="text-muted-text leading-relaxed">{homeContent.whyJoin}</p>
               </div>
               <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="mt-12 space-y-4">
                        <img src={homeContent.rfxImage} className="w-full aspect-[3/4] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700" alt="RFX" />
                        <div className="text-xs font-bold tracking-widest text-rfx-primary text-center">VISUAL ART</div>
                      </div>
                      <div className="space-y-4">
                        <img src={homeContent.femmoraImage} className="w-full aspect-[3/4] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700" alt="Femmora" />
                        <div className="text-xs font-bold tracking-widest text-fem-primary text-center">PREMIUM APPS</div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Why Us */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 border-t border-glass-border">
                {[{ icon: ShieldCheck, title: "SECURE", desc: "Transaksi 100% aman & legal." }, { icon: Zap, title: "FAST", desc: "Proses kilat tanpa drama." }, { icon: Heart, title: "HUMAN", desc: "Pelayanan ramah & personal." }].map((feat, idx) => (
                  <div key={idx} className="text-center p-8 hover:bg-white/5 transition-colors rounded-xl group">
                    <feat.icon className="w-8 h-8 mx-auto mb-6 text-gray-600 group-hover:text-white transition-colors" />
                    <h3 className="text-lg font-bold text-white tracking-widest mb-2">{feat.title}</h3>
                    <p className="text-gray-500 text-sm">{feat.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: RFX */}
        {activeTab === 'rfx' && (
          <div className="animate-pop pt-10">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <h2 className="text-6xl font-rfx text-white mb-2">Visuals.</h2>
                  <p className="text-rfx-primary tracking-widest text-sm uppercase">Creative Direction & Design</p>
               </div>
               {isAdminMode && <button onClick={() => setShowAddModal('rfx')} className="px-6 py-3 bg-white text-black text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors rounded-sm flex items-center gap-2"><Plus className="w-4 h-4" /> NEW SERVICE</button>}
            </div>
            {rfxItems.length === 0 ? <div className="text-center text-gray-600 py-20 italic">No services available yet.</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {rfxItems.map((item) => (<ItemCard key={item.id} item={item} isAdmin={isAdminMode} type="rfx" onClick={setSelectedItem} onDelete={(id) => handleDeleteItem(id, 'rfx')} />))}
                </div>
            )}
          </div>
        )}

        {/* TAB: FEMMORA */}
        {activeTab === 'femmora' && (
          <div className="animate-pop pt-10">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <h2 className="text-6xl font-femmora text-white mb-2">Store.</h2>
                  <p className="text-fem-primary tracking-widest text-sm uppercase">Premium Access & Gaming</p>
               </div>
               {isAdminMode && <button onClick={() => setShowAddModal('femmora')} className="px-6 py-3 bg-white text-black text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors rounded-sm flex items-center gap-2"><Plus className="w-4 h-4" /> NEW PRODUCT</button>}
            </div>
            {femmoraItems.length === 0 ? <div className="text-center text-gray-600 py-20 italic">No products available yet.</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {femmoraItems.map((item) => (<ItemCard key={item.id} item={item} isAdmin={isAdminMode} type="femmora" onClick={setSelectedItem} onDelete={(id) => handleDeleteItem(id, 'femmora')} />))}
                </div>
            )}
          </div>
        )}

        {/* TAB: TESTIMONI */}
        {activeTab === 'testimoni' && (
          <div className="animate-pop pt-10">
             <div className="flex justify-between items-end mb-16">
               <div>
                  <h2 className="text-6xl font-rfx text-white mb-2">Stories.</h2>
                  <p className="text-gold-accent tracking-widest text-sm uppercase">Real People, Real Result</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowUserReviewForm(true)} className="px-6 py-3 border border-white/20 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-colors rounded-sm">WRITE REVIEW</button>
                  {isAdminMode && <button onClick={() => setShowAddModal('gallery')} className="px-6 py-3 bg-gray-800 text-white text-xs font-bold tracking-widest hover:bg-gray-700 transition-colors rounded-sm flex items-center gap-2"><Plus className="w-4 h-4" /> ADD PROOF</button>}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
              {testimonials.length === 0 ? (<div className="col-span-full text-center text-gray-600 py-20 italic">No reviews yet.</div>) : (testimonials.map((item) => (<TestiCard key={item.id} item={item} isAdmin={isAdminMode} onDelete={(id) => handleDeleteItem(id, 'user_review')} />)))}
            </div>
            
            <div className="border-t border-glass-border pt-16">
               <h3 className="text-2xl font-rfx text-white mb-8">Proof of Work</h3>
               <div className="columns-2 md:columns-4 gap-4 space-y-4">
                {galleryItems.map((item) => (
                  <GalleryCard key={item.id} item={item} isAdmin={isAdminMode} onDelete={(id) => handleDeleteItem(id, 'gallery')} />
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <AIChatBot />
      <Footer onSecretTrigger={() => !isAdminMode && setShowLoginModal(true)} />

      {/* MODALS */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} isRfx={activeTab === 'rfx'} />}
      {showUserReviewForm && <UserReviewForm onSubmit={handleAddItem} onClose={() => setShowUserReviewForm(false)} />}
      {showAddModal && <AdminForm type={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddItem} />}
      {showEditHomeModal && <EditHomeModal currentData={homeContent} onClose={() => setShowEditHomeModal(false)} onSubmit={handleUpdateHome} />}
      
      {/* LOGIN MODAL (Diaktifkan lewat Secret Door di Footer) */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={() => { 
            setIsAdminMode(true); 
            setIsCommanderMode(true); // Mengaktifkan Tampilan HP
          }} 
        />
      )}
    </div>
  );
}
