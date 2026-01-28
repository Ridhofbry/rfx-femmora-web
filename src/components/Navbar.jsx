import React, { useState } from 'react';
import { Home, Palette, ShoppingCart, Star, Menu, X } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  // Logo Mewah (HANYA TEKS - Tanpa Kotak)
  const BrandLogo = ({ onClick }) => (
    <div className="relative group cursor-pointer select-none transform transition-transform duration-300 hover:scale-105 flex items-center gap-2" onClick={onClick}>
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="font-rfx text-xl md:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-sm filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">RFX</span>
        <span className="font-femmora font-bold text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-600 drop-shadow-sm filter drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]">FEMMORA</span>
      </div>
    </div>
  );

  const NavButton = ({ tab, label, icon: Icon, colorClass }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => handleNavClick(tab)} 
        className={`relative px-6 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
      >
        {isActive && (
            <span className="absolute inset-0 bg-white/5 rounded-full blur-md opacity-50"></span>
        )}
        <span className="relative z-10 flex items-center gap-2">
           {/* Icon Opsional di Desktop, dimunculkan biar manis */}
           <Icon className={`w-4 h-4 ${isActive ? colorClass : 'text-slate-500'}`} />
           {label}
        </span>
        {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></span>}
      </button>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-luxury-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          <BrandLogo onClick={() => handleNavClick('home')} />
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2 p-1">
            <NavButton tab="home" label="Home" icon={Home} colorClass="text-indigo-400" />
            <NavButton tab="rfx" label="Visual" icon={Palette} colorClass="text-cyan-400" />
            <NavButton tab="femmora" label="Store" icon={ShoppingCart} colorClass="text-pink-400" />
            <NavButton tab="testimoni" label="Stories" icon={Star} colorClass="text-yellow-400" />
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-silver-text hover:text-white transition-colors">
             {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-24 left-0 right-0 bg-luxury-black/95 backdrop-blur-xl border-b border-glass-border p-6 shadow-2xl animate-in slide-in-from-top-5 z-40 flex flex-col gap-4">
             <button onClick={() => handleNavClick('home')} className="text-left text-silver-text hover:text-cyan-400 font-rfx text-xl py-2 border-b border-white/5 flex items-center gap-3"><Home className="w-5 h-5"/> Home</button>
             <button onClick={() => handleNavClick('rfx')} className="text-left text-silver-text hover:text-cyan-400 font-rfx text-xl py-2 border-b border-white/5 flex items-center gap-3"><Palette className="w-5 h-5"/> Visual Services</button>
             <button onClick={() => handleNavClick('femmora')} className="text-left text-silver-text hover:text-pink-400 font-rfx text-xl py-2 border-b border-white/5 flex items-center gap-3"><ShoppingCart className="w-5 h-5"/> Premium Store</button>
             <button onClick={() => handleNavClick('testimoni')} className="text-left text-silver-text hover:text-yellow-400 font-rfx text-xl py-2 flex items-center gap-3"><Star className="w-5 h-5"/> Testimonials</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
