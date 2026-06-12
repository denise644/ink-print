import React from 'react';
import { ShoppingCart, Check, Package, Info, ArrowRight, Shield, Search, Users, FileText, CheckCircle2, Award, Truck, History, Headphones, Printer } from 'lucide-react';
import { Product } from './types.ts';
import { useCart } from './CartContext.tsx';
import { ProductImage } from './components/ProductImage.tsx';
import { motion } from 'motion/react';

export const ChiSiamo = ({ productCount }: { productCount?: number | null }) => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Chi Siamo</h2>
            <div className="w-16 h-1 bg-blue-600 rounded-full" />
            <p className="text-slate-600 font-medium leading-relaxed">
              Ink&Print By Denise è un ecommerce specializzato nella fornitura di toner e cartucce compatibili e originali per stampanti delle migliori marche. 
              La nostra missione è offrire prodotti affidabili, compatibilità garantita e assistenza dedicata per privati e aziende.
            </p>
            <p className="text-slate-600 font-medium leading-relaxed">
              Scegliamo solo i migliori fornitori per garantire stampe di qualità professionale a un prezzo contenuto. Con oltre {productCount ? productCount.toLocaleString('it-IT') : '1.500'} articoli a catalogo, 
              siamo il punto di riferimento per chi cerca convenienza senza compromessi.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">15+</div>
                <span className="text-xs font-bold text-slate-500 uppercase">Anni Esperienza</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">50k+</div>
                <span className="text-xs font-bold text-slate-500 uppercase">Clienti Soddisfatti</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800" 
              alt="Team at work" 
              className="rounded-3xl shadow-2xl h-[400px] w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/assets/images/toner_compat_bk_premium_1779958984462.png";
              }}
            />
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-3xl shadow-xl max-w-[240px]">
              <p className="text-2xl font-black mb-1">Affidabili.</p>
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-tight">Specialisti nei consumabili da record.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const PreventiviAziendali = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 lg:p-20 overflow-hidden relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                <Users size={14} /> Per Aziende e Uffici
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Richiedi un Preventivo <br/>
                <span className="text-blue-400 font-medium">Personalizzato</span>
              </h2>
              <p className="text-blue-100/60 font-medium text-lg leading-relaxed">
                Gestiamo forniture aziendali su grandi volumi con listini dedicati e un Account Manager dedicato alle tue esigenze di stampa.
              </p>
              <ul className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  { icon: FileText, text: "Fatturazione PA" },
                  { icon: CheckCircle2, text: "Prezzi all'ingrosso" },
                  { icon: Award, text: "Qualità Garantita" },
                  { icon: History, text: "Ordini Ricorrenti" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold opacity-90 transition-all hover:translate-x-1 group">
                    <item.icon size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    {item.text}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <button 
                  onClick={() => onNavigate('b2b')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-1"
                >
                  Richiedi Preventivo
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-blue-600/40 to-indigo-600/40 w-full aspect-square rounded-[3rem] absolute blur-3xl -z-10 animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                     <div className="text-3xl font-black text-blue-400 mb-1">-35%</div>
                     <p className="text-[10px] uppercase font-black opacity-60">Risparmio Medio Uffici</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                     <div className="text-3xl font-black text-green-400 mb-1">0%</div>
                     <p className="text-[10px] uppercase font-black opacity-60">Errori Compatibilità</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                     <div className="text-3xl font-black text-white mb-1">24h</div>
                     <p className="text-[10px] uppercase font-black opacity-60">Consegna Uffici Express</p>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-2xl text-slate-900 border-2 border-blue-100">
                     <Truck className="text-blue-600 mb-4" size={32} />
                     <p className="text-xs font-black uppercase mb-2">Spedizione Gratuita</p>
                     <p className="text-[10px] font-bold text-slate-500">Sopra i 150€ per aziende</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const GaranziaProdotti = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Perché Sceglierci?</h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full" />
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest pt-2">Affidabilità e Garanzia Totale</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Compatibilità Garantita", 
              desc: "Tutti i nostri prodotti sono testati per garantire il 100% di compatibilità con la tua stampante senza invalidare la garanzia.",
              icon: Shield,
              color: "bg-blue-50 text-blue-600"
            },
            { 
              title: "Assistenza Post-Vendita", 
              desc: "Il nostro team tecnico è sempre disponibile per aiutarti con l'installazione o risolvere qualsiasi problema via WhatsApp o Email.",
              icon: Headphones,
              color: "bg-green-50 text-green-600"
            },
            { 
              title: "Reso Facile 30 Giorni", 
              desc: "Se non sei soddisfatto o hai sbagliato acquisto, puoi restituire i prodotti entro 30 giorni grazie al nostro portale interattivo.",
              icon: History,
              color: "bg-purple-50 text-purple-600"
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group text-left"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProductCard = ({ product, onNavigate }: { product: Product, key?: React.Key, onNavigate?: (page: string, data?: any) => void }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleDetailsClick = () => {
    if (onNavigate) {
      onNavigate('product-detail', product);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleDetailsClick}
      className={`group bg-white rounded-2xl p-4 border border-slate-200 flex flex-col shadow-sm hover:shadow-md transition-shadow relative ${onNavigate ? 'cursor-pointer' : ''}`}
    >
      {/* Badge Disponibilità */}
      <div className={`absolute top-4 left-4 z-10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${product.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {product.availability ? 'In Stock' : 'Esaurito'}
      </div>

      {/* Image Area */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-2">
        <ProductImage product={product} />
      </div>

      {/* Info Area */}
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{product.brand} COMPATIBILE</span>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 min-h-[40px] leading-tight group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1.5 mt-1">
          <Printer size={12} className="text-blue-500 shrink-0" />
          <p className="text-[11px] text-slate-500 line-clamp-1">
             {(product.compatibility || []).slice(0, 2).join(' / ')}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-dark">€{product.price.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Iva Inclusa</span>
          </div>
          
          <button 
            disabled={!product.availability}
            onClick={handleAdd}
            className={`w-9 h-9 rounded-lg transition-all duration-300 flex items-center justify-center ${
              !product.availability 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : added 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95'
            }`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const Hero = ({ onNavigate, productCount }: { onNavigate: (page: string) => void, productCount?: number | null }) => {
  return (
    <section className="relative overflow-hidden bg-brand-medium py-16 lg:py-24">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-white/20 rounded-full px-5 py-2 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]" />
            <span className="text-blue-100 text-[11px] font-black uppercase tracking-[0.2em] text-shadow-sm">Forniture Professionali 2026</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">
            Toner & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-white">Supplies</span>
          </h1>
          
          <p className="text-lg text-blue-100/70 max-w-lg leading-relaxed font-bold uppercase tracking-tight">
            L'hub tecnologico per i tuoi consumabili. <br/>
            <span className="text-blue-400">Qualità Premium</span> garantita su over {productCount ? productCount.toLocaleString('it-IT') : '1.500'} articoli con logistica express.
          </p>
 
          <div className="flex flex-wrap gap-5 pt-4">
            <button 
              onClick={() => onNavigate('catalog')}
              className="group relative bg-white text-brand-medium px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Esplora Magazzino <ArrowRight size={18} /></span>
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => onNavigate('b2b')}
              className="bg-white/5 backdrop-blur-md border border-white/20 text-white px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Listino B2B
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative hidden lg:block"
        >
          {/* Main Hero Image Container */}
          <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 glass-dark glow-blue">
            <img 
              src="/assets/images/hero_ecommerce_supplies_1779955116676.png" 
              alt="Printer Supplies Premium" 
              className="w-full h-auto opacity-100 object-cover scale-100"
              onError={(e) => {
                e.currentTarget.src = "/assets/images/toner_compat_bk_premium_1779958984462.png";
              }}
            />
            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 via-transparent to-transparent pointer-events-none" />
            
            {/* Status floating badge */}
            <div className="absolute top-6 right-6 px-4 py-2 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">
              Partner Tecnologico
            </div>

            {/* Float badge bottom */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/10 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-2xl">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner-white">
                 <Shield className="text-white" size={24} />
              </div>
              <div className="text-white">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Garanzia Totale</p>
                <p className="text-base font-black">36 Mesi Inclusi</p>
              </div>
            </div>
          </div>
          
          {/* Decorative floating elements */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-32 h-32 glass rounded-3xl -rotate-6 z-0 opacity-40 blur-[1px]" 
          />
          <motion.div 
            animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl z-0" 
          />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] z-0" />
        </motion.div>
      </div>
    </section>
  );
};

export const ComeFunziona = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const steps = [
    {
      id: "01",
      title: "Cerca il Prodotto",
      desc: "Trova toner o cartuccia tramite marca, modello stampante o codice prodotto.",
      icon: Search,
      slug: "catalog"
    },
    {
      id: "02",
      title: "Controlla Compatibilità",
      desc: "Ogni prodotto mostra chiaramente le stampanti compatibili e i dettagli tecnici.",
      icon: Info,
      slug: "compatibilita"
    },
    {
      id: "03",
      title: "Acquista in Sicurezza",
      desc: "Checkout rapido con pagamenti protetti e spedizione veloce in 24/48 ore.",
      icon: Shield,
      slug: "sicurezza"
    },
    {
      id: "04",
      title: "Ricevi e Risparmia",
      desc: "Monitora il tuo ordine con il tracking live e goditi stampe di alta qualità.",
      icon: Package,
      slug: "ordini"
    }
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Come Funziona Ink&Print By Denise</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          <p className="text-slate-500 font-medium text-lg leading-relaxed pt-2">
            Il processo più semplice e veloce sul mercato per acquistare consumabili professionali.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connector lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 bg-white"
            >
              <div 
                onClick={() => onNavigate(step.slug)}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 shadow-sm border border-slate-100">
                  <step.icon size={32} />
                </div>
                <div className="absolute -top-4 right-1/2 translate-x-12 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-black text-blue-600 shadow-sm group-hover:border-blue-600 transition-colors">
                  STEP {step.id}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium px-4">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
