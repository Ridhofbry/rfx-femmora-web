import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';

const Footer = ({ onSecretTrigger }) => {
  const [clickCount, setClickCount] = useState(0);

  // LOGIKA RAHASIA: Klik 5x reset dalam 2 detik
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 === 5) {
      onSecretTrigger(); // Buka Login Modal
      setClickCount(0);
    }
    // Reset counter kalau user berhenti klik
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <footer className="border-t border-glass-border mt-32 bg-black py-20 font-body relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-rfx-primary to-transparent opacity-20 blur-sm"></div>

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center items-center gap-3 mb-8 opacity-80 hover:opacity-100 transition-opacity">
          <LayoutGrid className="text-rfx-primary w-6 h-6" />
          <h2 className="text-2xl font-rfx tracking-widest text-silver-text">
            RFX <span className="text-fem-primary">FEMMORA</span>
          </h2>
        </div>
        
        <p className="text-muted-text text-sm mb-12 max-w-lg mx-auto leading-loose font-light tracking-wide">
          Kami memadukan estetika visual kelas atas dengan akses hiburan premium. 
          Satu platform untuk kreator dan gamer sejati.
        </p>
        
        <div className="flex justify-center gap-12 text-silver-text text-xs font-bold tracking-[0.2em] uppercase mb-16">
          <a href="#" className="hover:text-rfx-primary transition-colors hover:underline decoration-rfx-primary underline-offset-8">Instagram</a>
          <a href="#" className="hover:text-fem-primary transition-colors hover:underline decoration-fem-primary underline-offset-8">WhatsApp</a>
          <a href="#" className="hover:text-white transition-colors hover:underline decoration-white underline-offset-8">Discord</a>
        </div>
        
        {/* AREA RAHASIA (Secret Door) */}
        <div 
          onClick={handleSecretClick} 
          className="text-gray-700 text-[10px] font-mono tracking-widest cursor-default select-none hover:text-gray-600 transition-colors"
        >
          © 2026 RFX FEMMORA COLLABORATION.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
