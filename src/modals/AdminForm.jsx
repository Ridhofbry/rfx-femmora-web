import React, { useState } from 'react';
import { Plus, ImageIcon } from 'lucide-react';
import { generateGeminiContent } from '../config/firebase'; // Integrasi Logic AI Baru

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
    
    const prompt = `Buatlah deskripsi marketing yang singkat, menarik, gaul, dan persuasif (bahasa Indonesia) untuk: Nama: ${title}. Harga: ${price || 'Terjangkau'}. Kategori: ${contextType}. Konteks: Dijual di RFX Femmora. Gunakan emoji yang relevan. Jangan terlalu panjang, maksimal 3 kalimat.`;
    
    const result = await generateGeminiContent(prompt);
    setDesc(result); 
    setIsGenerating(false);
  };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    onSubmit({ title, price, desc, imageUrl, type }); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-body animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center border-b border-slate-800 pb-4">
            <Plus className="w-6 h-6 mr-3 text-cyan-400 p-1 bg-cyan-400/10 rounded-lg" /> Tambah {type === 'gallery' ? 'Galeri Bukti' : 'Konten Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{type === 'gallery' ? 'Judul Bukti' : 'Nama Produk'}</label>
            <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Bukti Transfer / Akun Netflix" />
          </div>
          
          {type !== 'gallery' && (
            <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Harga (IDR)</label>
                <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{type === 'gallery' ? 'Keterangan Singkat' : 'Deskripsi'}</label>
                {type !== 'gallery' && <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-md text-white font-bold flex items-center gap-1">{isGenerating ? '...' : '✨ AI'}</button>}
            </div>
            <textarea required rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Link Gambar</label>
            <div className="flex gap-2">
                <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <div className="bg-slate-800 p-3 rounded-xl flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 text-gray-400" /></div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300">Batal</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-pink-600 text-white font-bold">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
