import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const LoginModal = ({ onClose, onSuccess }) => {
  const [pass, setPass] = useState(''); 
  const [error, setError] = useState(false);

  const handleLogin = (e) => { 
    e.preventDefault(); 
    // MENGAMBIL PASSWORD DARI ENV (Keamanan Phase 2 dicicil disini)
    // Jika di .env belum diset, default fallback sementara ke password lama agar tidak error
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || '19201802';
    
    if (pass === adminPass) { 
      onSuccess(); 
      onClose(); 
    } else { 
      setError(true); 
      setPass(''); 
    } 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Admin Access</h3>
        <p className="text-slate-400 text-sm mb-6">Masukkan password untuk mengelola konten.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            autoFocus 
            className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-800'} rounded-xl p-3 text-center text-white focus:outline-none focus:border-cyan-500 tracking-widest text-lg`} 
            placeholder="••••••••" 
            value={pass} 
            onChange={(e) => { setPass(e.target.value); setError(false); }} 
          />
          {error && <p className="text-red-400 text-xs font-bold">Password salah!</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white font-bold">Batal</button>
            <button type="submit" className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/20">Masuk</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
