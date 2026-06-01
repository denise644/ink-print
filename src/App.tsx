/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, Footer } from './Layout.tsx';
import { Hero, ComeFunziona, ChiSiamo, PreventiviAziendali, GaranziaProdotti } from './Components.tsx';
import { AIChat } from './AIChat.tsx';
import { Catalog } from './Catalog.tsx';
import { CatalogListino } from './CatalogListino.tsx';
import { TrackOrder } from './TrackOrder.tsx';
import { DeliveryNote } from './DeliveryNote.tsx';
import { CompatibilityPage } from './CompatibilityPage.tsx';
import { SecurityPage } from './SecurityPage.tsx';
import { ProductDetailPage } from './ProductDetailPage.tsx';
import { CartPage } from './CartPage.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { B2BPage } from './B2BPage.tsx';
import { LavoraConNoi } from './LavoraConNoi.tsx';
import { PagamentiPage } from './PagamentiPage.tsx';
import { PrivacyPolicy } from './PrivacyPolicy.tsx';
import { CookiePolicy } from './CookiePolicy.tsx';
import { TerminiCondizioni } from './TerminiCondizioni.tsx';
import { Contatti } from './Contatti.tsx';
import { Product } from './types.ts';
import { CartProvider } from './CartContext.tsx';
import { useEffect } from 'react';
import { Laptop, Wifi, Shield, Smartphone, PenTool, Headphones, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HomePage = ({ onNavigate, productCount }: { onNavigate: (page: string, data?: any) => void, productCount: number | null }) => {
  return (
    <div>
      <Hero onNavigate={onNavigate} productCount={productCount} />
      <ComeFunziona onNavigate={onNavigate} />
      
      {/* Featured Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <div className="w-12 h-1.5 bg-blue-600 rounded-full" />
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Sfoglia per Categoria</h2>
            </div>
            <button 
              onClick={() => onNavigate('catalog')}
              className="group flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              Vedi Tutto <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: null, image: "/src/assets/images/toner_compat_cmy_premium_1779959002014.png", title: "Toner", desc: "Compatibili e Originali", color: "bg-blue-100 text-blue-600", slug: "Toner Compatibili" },
              { icon: null, image: "/src/assets/images/inkjet_compat_generic_template_1779959041117.png", title: "Inkjet", desc: "Qualità Garantita", color: "bg-indigo-100 text-indigo-600", slug: "Cartucce Compatibili" },
              { icon: null, image: "/src/assets/images/drum_unit_premium_template_1779959019359.png", title: "Drum", desc: "Accessori e Unità", color: "bg-purple-100 text-purple-600", slug: "Drum" },
              { icon: Headphones, image: "", title: "Supporto", desc: "Assistenza Tecnica", color: "bg-green-100 text-green-600", slug: "assistenza" },
            ].map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <motion.div 
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-3xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all text-center cursor-pointer"
                  onClick={() => cat.slug === 'assistenza' ? onNavigate('contatti') : onNavigate('catalog', cat.slug)}
                >
                  <div className={`w-16 h-16 ${cat.image ? 'p-1.5 bg-white border border-slate-100' : cat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm overflow-hidden`}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                    ) : (
                      IconComp && <IconComp size={32} />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{cat.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{cat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
 
      <GaranziaProdotti />
      <ChiSiamo productCount={productCount} />
      <PreventiviAziendali onNavigate={onNavigate} />

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl">
            <div className="relative z-10 space-y-6 max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight">Ottimizza le tue <br/> Spese di Stampa</h2>
              <p className="text-blue-100 text-lg font-medium">Unisciti a migliaia di clienti che hanno scelto Ink&Print By Denise per le loro forniture professionali.</p>
              <button onClick={() => onNavigate('catalog')} className="bg-white text-blue-600 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto lg:mx-0 shadow-xl">
                Catalogo Completo <ArrowRight size={20} />
              </button>
            </div>
            <div className="relative z-10 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 rotate-3">
                <ShoppingCart className="text-white" size={64} />
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeOrderData, setActiveOrderData] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/products-count')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          setProductCount(data.count);
        }
      })
      .catch(err => console.error("Error loading products count:", err));
  }, []);

  useEffect(() => {
    // Gestione dei path per simulare il routing
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/gestione-logistica') {
        setCurrentPage('gestione-logistica');
      } else if (path === '/admin') {
        window.history.replaceState(null, '', '/gestione-logistica');
        setCurrentPage('gestione-logistica');
      } else if (currentPage === 'gestione-logistica') {
        setCurrentPage('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem('cookie-consent-given');
      if (!consent) {
        setShowCookieBanner(true);
      } else {
        setShowCookieBanner(false);
      }
    };
    checkConsent();

    const handleConsentUpdate = () => {
      localStorage.setItem('cookie-consent-given', 'true');
      setShowCookieBanner(false);
    };

    window.addEventListener('cookie-consent-updated', handleConsentUpdate);
    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate);
    };
  }, []);

  const handleAcceptAllCookies = () => {
    localStorage.setItem('cookie-consent-given', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({ technical: true, analytics: true, marketing: true }));
    setShowCookieBanner(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie-consent-given', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({ technical: true, analytics: false, marketing: false }));
    setShowCookieBanner(false);
  };

  const handleSearch = (val: string) => {
    setGlobalSearch(val);
    setActiveCategory("");
    setCurrentPage('catalog');
  };

  const handleNavigate = (page: string, data?: any) => {
    let targetPage = page;
    if (page === 'admin') {
      targetPage = 'gestione-logistica';
    }
    
    setCurrentPage(targetPage);
    window.scrollTo(0, 0);

    // Aggiorna la barra degli indirizzi reale se siamo in logistica, altrimenti riposiziona su root
    if (targetPage === 'gestione-logistica') {
      window.history.pushState(null, '', '/gestione-logistica');
    } else {
      window.history.pushState(null, '', '/');
    }

    if (targetPage === 'catalog' && typeof data === 'string') {
      setActiveCategory(data);
      setGlobalSearch("");
    } else if (targetPage === 'catalog' && !data) {
      setActiveCategory("");
    }
    if (targetPage === 'bolla') {
      setActiveOrderData(data);
    }
    if (targetPage === 'product-detail' && data) {
      setSelectedProduct(data);
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 text-slate-900">
        <Navbar onSearch={handleSearch} onNavigate={handleNavigate} />
        
        <main>
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} productCount={productCount} />}
          {currentPage === 'catalog' && <Catalog initialSearch={globalSearch} initialCategory={activeCategory} onNavigate={handleNavigate} />}
          {currentPage === 'listino' && <CatalogListino />}
          {currentPage === 'ordini' && <TrackOrder onNavigate={handleNavigate} />}
          {currentPage === 'bolla' && <DeliveryNote order={activeOrderData} onBack={() => handleNavigate('ordini')} />}
          {currentPage === 'compatibilita' && <CompatibilityPage onBack={() => handleNavigate('home')} />}
          {currentPage === 'sicurezza' && <SecurityPage onBack={() => handleNavigate('home')} />}
          {currentPage === 'product-detail' && selectedProduct && <ProductDetailPage product={selectedProduct} onBack={() => handleNavigate('catalog')} onNavigate={handleNavigate} />}
          {currentPage === 'carrello' && <CartPage onBack={() => handleNavigate('catalog')} onNavigate={handleNavigate} />}
          {currentPage === 'gestione-logistica' && <AdminDashboard onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />}
          {currentPage === 'b2b' && <B2BPage onBack={() => handleNavigate('home')} />}
          {currentPage === 'lavora-con-noi' && <LavoraConNoi onBack={() => handleNavigate('home')} />}
          {currentPage === 'pagamenti' && <PagamentiPage onBack={() => handleNavigate('home')} />}
          {currentPage === 'privacy-policy' && <PrivacyPolicy onBack={() => handleNavigate('home')} />}
          {currentPage === 'cookie-policy' && <CookiePolicy onBack={() => handleNavigate('home')} />}
          {currentPage === 'termini-condizioni' && <TerminiCondizioni onBack={() => handleNavigate('home')} />}
          {currentPage === 'contatti' && <Contatti onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />}
          {!['home', 'catalog', 'listino', 'ordini', 'bolla', 'compatibilita', 'sicurezza', 'product-detail', 'carrello', 'gestione-logistica', 'b2b', 'lavora-con-noi', 'pagamenti', 'privacy-policy', 'cookie-policy', 'termini-condizioni', 'contatti'].includes(currentPage) && (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
              <h2 className="text-4xl font-bold mb-4 uppercase tracking-tight">{currentPage.replace('-', ' ')}</h2>
              <p className="text-slate-500 mb-8 max-w-lg mx-auto">Questa sezione è in fase di allestimento. Torna presto per scoprire tutte le novità di Ink&Print By Denise.</p>
              <button 
                onClick={() => setCurrentPage('home')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Torna alla Home
              </button>
            </div>
          )}
        </main>

        <Footer onNavigate={handleNavigate} />
        
        {/* Cookie Consent Banner */}
        <AnimatePresence>
          {showCookieBanner && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-300 p-6 z-[90] shadow-2xl font-sans"
              id="cookie-consent-bar"
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-sm font-black text-white uppercase tracking-wider block">Informativa Informativa sui Cookie 🍪</span>
                  <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
                    Utilizziamo cookie tecnici per salvare la navigazione e cookie analitici anonimi per misurare le prestazioni del nostro catalogo toner e cartucce. Cliccando su "Accetta Tutti" acconsenti all'uso dei sistemi di tracciamento. Puoi personalizzare la tua scelta cliccando su Personalizza o rifiutare attivando solo i cookie tecnici di base. Consulta la nostra{' '}
                    <span 
                      onClick={() => handleNavigate('cookie-policy')}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Cookie Policy
                    </span>.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleNavigate('cookie-policy')}
                    className="bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Personalizza
                  </button>
                  <button 
                    onClick={handleDeclineCookies}
                    className="bg-slate-800 hover:bg-slate-705 text-slate-400 font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-wider border border-slate-700/60 transition-all hover:text-white"
                  >
                    Solo Tecnici
                  </button>
                  <button 
                    onClick={handleAcceptAllCookies}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md"
                  >
                    Accetta Tutti
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Smart AI Assistant */}
        <div className="fixed bottom-8 right-8 z-50">
          <AIChat />
        </div>
      </div>
    </CartProvider>
  );
}



