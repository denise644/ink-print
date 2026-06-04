import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, X, User, Phone, Mail, MapPin, Printer, Laptop, Smartphone, Wifi, Shield, FileText, CheckCircle } from 'lucide-react';
import { useCart } from './CartContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = ({ onSearch, onNavigate }: { onSearch: (val: string) => void, onNavigate: (page: string, category?: string) => void }) => {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <nav className="glass sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-brand-dark text-white py-1.5 px-4 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> +39 327 6978338</span>
            <span className="flex items-center gap-1"><Mail size={12} /> inkprint26@gmail.com</span>
          </div>
          <div className="flex gap-4 items-center">
            <span onClick={() => onNavigate('admin')} className="hover:text-blue-400 cursor-pointer transition-colors flex items-center gap-1"><User size={12} /> Accesso Admin</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
        <div onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer group">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-white">
            <img 
              src="/src/assets/images/inkprint_new_logo_1779957051282.png" 
              alt="Ink&Print Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-slate-950 uppercase">Ink&Print</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">By Denise</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
          <input 
            type="text" 
            placeholder="Cerca per SKU, nome, stampante, categoria..." 
            className="w-full bg-slate-100 border-none rounded-full py-2 px-6 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
            <Search size={18} />
          </button>
        </form>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs text-slate-500 font-medium">Contatto Rapido</span>
            <span className="text-sm font-bold text-slate-900">+39 327 6978338</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-700">
            <button onClick={() => onNavigate('carrello')} className="relative hover:text-blue-600 transition-colors">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-out fade-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Nav */}
      <div className="bg-slate-50 border-t border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {[
            { name: "TUTTI I PRODOTTI", slug: "catalog" },
            { name: "TONER COMPATIBILI", slug: "Toner Compatibili" },
            { name: "TONER ORIGINALI", slug: "Toner Originali" },
            { name: "INKJET COMPATIBILI", slug: "Cartucce Compatibili" },
            { name: "INKJET ORIGINALI", slug: "Cartucce Originali" },
            { name: "DRUM", slug: "Drum" },
            { name: "INCHIOSTRI COMPATIBILI", slug: "Inchiostri Compatibili" }
          ].map((cat) => (
            <button 
              key={cat.name} 
              onClick={() => cat.slug === 'catalog' ? onNavigate('catalog') : onNavigate('catalog', cat.slug)}
              className="py-3 text-xs font-bold text-slate-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all uppercase tracking-wider"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input 
                  type="text" 
                  placeholder="Cerca prodotti..." 
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </form>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Home", slug: "home" },
                  { name: "Catalogo Completo", slug: "catalog" },
                  { name: "Toner Compatibili", slug: "Toner Compatibili" },
                  { name: "Toner Originali", slug: "Toner Originali" },
                  { name: "Inkjet Compatibili", slug: "Cartucce Compatibili" },
                  { name: "Inkjet Originali", slug: "Cartucce Originali" },
                  { name: "Drum", slug: "Drum" },
                  { name: "Inchiostri Compatibili", slug: "Inchiostri Compatibili" },
                  { name: "Accesso Admin", slug: "admin" }
                ].map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => {
                      if (['home', 'catalog', 'admin'].includes(link.slug)) onNavigate(link.slug);
                      else onNavigate('catalog', link.slug);
                      setIsMenuOpen(false);
                    }}
                    className="text-left py-3 px-2 text-slate-900 font-semibold border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = ({ onNavigate }: { onNavigate: (page: string, category?: string) => void }) => {
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Come verifico se un toner è compatibile con la mia stampante?",
      a: "Puoi verificare inserendo la sigla esatta della tua stampante o del consumabile originale (es. CF259A, 603XL) nella barra di ricerca. Tutti i prodotti riportano la lista delle stampanti verificate nella scheda dettagliata."
    },
    {
      q: "Quali sono i tempi di spedizione per toner e cartucce?",
      a: "Tutti gli ordini ricevuti entro le ore 14:00 vengono affidati al corriere espresso lo stesso giorno. La consegna avviene in 24/48 ore su tutto il territorio nazionale (72 ore per isole minori e CAP disagiati)."
    },
    {
      q: "I prodotti compatibili possono danneggiare la mia macchina?",
      a: "Assolutamente no. I nostri toner e cartucce compatibili Premium Pro-Toner sono certificati ISO 9001 e ISO 14001, progettati specificamente per garantire prestazioni pari all'originale senza invalidare la garanzia legale."
    },
    {
      q: "Come funziona la procedura di reso e rimborso?",
      a: "Puoi richiedere il reso gratuito entro 14 giorni dall'acquisto qualora i consumabili rimangano imballati, oppure avviare una richiesta di sostituzione in garanzia. Ti basta compilare il 'Modulo Reso' sul portale."
    }
  ];

  const handleFAQToggle = (index: number) => {
    setActiveFAQIndex(activeFAQIndex === index ? null : index);
  };

  return (
    <>
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-32 md:pb-44 border-t border-slate-900 font-sans relative z-10" id="professional-footer">
        
        {/* Main Footer Widget Area */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Company Bio column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onNavigate('home')}>
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                <Laptop size={22} className="text-white animate-pulse" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">Ink&Print<span className="font-light text-blue-500 italic uppercase text-lg"> By Denise</span></span>
            </div>
            
            <p className="text-[12px] leading-relaxed text-slate-400 font-medium">
              E-commerce professionale specializzato in toner, tamburi e cartucce compatibili e originali. Offriamo compatibilità verificata al 100%, spedizioni fulminee e supporto dedicato pre e post vendita.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-4">
                <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-normal">Via Sabella 11, 92028 Naro (AG), Sicilia, Italia</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={16} className="text-blue-500 shrink-0" />
                <a href="tel:+393276978338" className="text-xs font-semibold hover:text-white transition-colors">+39 327 6978338</a>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={16} className="text-blue-500 shrink-0 animate-pulse" />
                <a href="mailto:inkprint26@gmail.com" className="text-xs font-semibold hover:text-white transition-colors text-slate-400">inkprint26@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Legal Pages Column */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-6 border-l-2 border-blue-600 pl-3">Informazioni Legali</h4>
            <ul className="space-y-3.5 text-xs font-semibold">
              <li>
                <span 
                  onClick={() => onNavigate('privacy-policy')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-2"
                >
                  <FileText size={12} className="text-slate-600 shrink-0" /> Privacy Policy GDPR
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('cookie-policy')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-2"
                >
                  <FileText size={12} className="text-slate-600 shrink-0" /> Cookie Policy Integrata
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('termini-condizioni')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-2"
                >
                  <FileText size={12} className="text-slate-600 shrink-0" /> Termini e Condizioni
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('pagamenti')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  💳 Metodi di Pagamento Sicuri
                </span>
              </li>
            </ul>
          </div>

          {/* Catalog Segments Column */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-6 border-l-2 border-blue-600 pl-3">Catalogo Prodotti</h4>
            <ul className="space-y-3.5 text-xs font-semibold font-sans">
              <li>
                <span 
                  onClick={() => onNavigate('catalog', 'Toner Compatibili')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  • Toner Compatibili
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('catalog', 'Toner Originali')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  • Toner Originali
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('catalog', 'Cartucce Compatibili')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  • Inkjet Compatibili
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('catalog', 'Cartucce Originali')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  • Inkjet Originali
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('catalog', 'Tamburi')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  • Drum
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigate('catalog', 'Inchiostri')}
                  className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205 flex items-center gap-1"
                >
                  • Inchiostri Compatibili
                </span>
              </li>
            </ul>
          </div>

          {/* Support and Company Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-5 border-l-2 border-blue-600 pl-3">Sito & Azienda</h4>
              <ul className="space-y-3.5 text-xs font-semibold">
                <li>
                  <span 
                    onClick={() => onNavigate('home')}
                    className="hover:text-blue-400 hover:pl-1.5 cursor-pointer transition-all duration-205"
                  >
                    Chi Siamo
                  </span>
                </li>

                <li>
                  <span 
                    onClick={() => setIsFAQOpen(true)}
                    className="text-amber-400 hover:text-amber-350 cursor-pointer transition-all duration-205 flex items-center gap-1 font-bold"
                  >
                    ❓ Domande Frequenti (FAQ)
                  </span>
                </li>
                <li>
                  <span 
                    onClick={() => onNavigate('contatti')}
                    className="text-white bg-blue-600/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase transition-all inline-block font-black shrink-0"
                  >
                    Contatta Assistenza Clienti
                  </span>
                </li>
              </ul>
            </div>
            
            {/* Quick SSL & Trust Badge */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400">
                <Shield size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-white font-black uppercase tracking-wider font-mono">CONSEGNA SSL CIFRATA</p>
                <p className="text-[9px] text-slate-400 font-bold whitespace-nowrap leading-none">Certificato Sicuro RSA 256-bit</p>
              </div>
            </div>
          </div>

        </div>

        {/* Separator, PIVA, and Secure Payments Area */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-900 pt-10 mt-10 space-y-8">
          
          <div className="flex flex-col items-center justify-center text-center gap-6 border-b border-slate-900 pb-8">
            {/* Payment Solutions row */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">Transazioni E-commerce Protette e Sicure 💳</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Visual Payments logos label representations */}
                {['Visa', 'Mastercard', 'PayPal', 'Carte di Debito', 'Bonifico Bancario'].map(label => (
                  <span key={label} className="bg-slate-900/80 border border-slate-800/80 text-slate-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg font-mono tracking-wider">{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright automatic and Legal Credits info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500">
            <div className="text-center md:text-left space-y-1">
              <p className="font-bold text-slate-450 tracking-wide font-mono uppercase">&copy; {new Date().getFullYear()} Ink&Print By Denise - Specialisti dei Consumabili di Stampa.</p>
              <p className="leading-relaxed">Sede Legale: Via Sabella 11, 92028 Naro (AG), Sicilia, Italia • Partita IVA / Codice Fiscale: IT01234567890 • Capitale Sociale i.v. € 50.000,00</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 uppercase font-black tracking-widest text-slate-500 text-[9px]">
              <span onClick={() => onNavigate('privacy-policy')} className="hover:text-blue-500 cursor-pointer transition-colors">Privacy</span>
              <span>•</span>
              <span onClick={() => onNavigate('cookie-policy')} className="hover:text-blue-500 cursor-pointer transition-colors">Cookies</span>
              <span>•</span>
              <span onClick={() => onNavigate('termini-condizioni')} className="hover:text-blue-500 cursor-pointer transition-colors">Termini</span>
              <span>•</span>
              <span onClick={() => onNavigate('contatti')} className="hover:text-blue-500 cursor-pointer transition-colors">Contatti</span>
            </div>
          </div>

        </div>

      </footer>

      {/* Interactive FAQ Backdrop Accordion Modal */}
      <AnimatePresence>
        {isFAQOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
            id="faq-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden p-6 md:p-8"
              id="faq-modal-card"
            >
              {/* Modal Head */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">FAQ e Supporto Tecnico</h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase">Risposte immediate alle domande di compatibilità e logistica</p>
                </div>
                <button 
                  onClick={() => setIsFAQOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2.5 rounded-full text-xs font-black transition-transform hover:rotate-90"
                >
                  ✕
                </button>
              </div>

              {/* FAQ Accordion list */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {faqs.map((faq, index) => {
                  const isOpen = activeFAQIndex === index;
                  return (
                    <div 
                      key={index}
                      className="border border-slate-150/80 rounded-2xl overflow-hidden"
                    >
                      <button 
                        onClick={() => handleFAQToggle(index)}
                        className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/50 flex justify-between items-center focus:outline-none transition-colors"
                      >
                        <span className="text-xs font-black text-slate-900 leading-snug">{faq.q}</span>
                        <span className="text-xs font-bold shrink-0 ml-4 text-blue-600">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white border-t border-slate-100 overflow-hidden"
                          >
                            <p className="p-4 text-xs leading-relaxed text-slate-500 font-medium">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer Callout */}
              <div className="mt-8 pt-5 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold">
                <span className="text-slate-400">Non hai trovato la risposta? Scrivici.</span>
                <button 
                  onClick={() => {
                    setIsFAQOpen(false);
                    onNavigate('contatti');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-[10px] uppercase"
                >
                  Contattaci Direttamente
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
