import React, { useState, useEffect } from 'react';
import { fetchSupabaseProducts, isSupabaseConfigured, getSupabaseConfigInfo, supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../CartContext.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Copy, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';

interface SupabaseProductsSectionProps {
  onNavigate: (page: string, data?: any) => void;
}

export const SupabaseProductsSection: React.FC<SupabaseProductsSectionProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [configured, setConfigured] = useState<boolean>(isSupabaseConfigured());
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const configInfo = getSupabaseConfigInfo();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const data = await fetchSupabaseProducts();
        setProducts(data);
      } else {
        setError("Supabase non è configurato. Assicurati che le variabili NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY siano valorizzate su Vercel o nel file .env.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Impossibile recuperare i dati dal database Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setLastAddedId(product.id);
    setTimeout(() => {
      setLastAddedId(null);
    }, 2000);
  };

  const handleCopySql = () => {
    const sqlText = `-- 1. Crea la tabella "products" nel SQL Editor di Supabase
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  brand VARCHAR(255),
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  availability BOOLEAN DEFAULT true,
  compatibility TEXT[] DEFAULT '{}',
  description TEXT,
  image TEXT
);

-- 2. Inserisci record di esempio per testare l'e-commerce
INSERT INTO products (sku, name, category, brand, price, availability, compatibility, description, image) VALUES 
('TN-2420-BK', 'Toner Compatibile TN-2420 Alta Capacità', 'Toner Compatibili', 'Brother', 14.90, true, ARRAY['Brother HL-L2310D', 'Brother MFC-L2710DN'], 'Toner nero professionale con resa garantita di 3000 pagine al 5% di copertura.', '/src/assets/images/toner_compat_bk_premium_1779958984462.png'),
('HP-305XL-COL', 'Cartuccia Originale HP 305XL Tricolore', 'Cartucce Originali', 'HP', 24.50, true, ARRAY['HP DeskJet 2710', 'HP ENVY 6020'], 'Cartuccia tricolore originale ad alta capacità per stampe nitide e brillanti.', '/src/assets/images/inkjet_orig_template_2_1779958733126.png'),
('CAN-054H-MA', 'Toner Compatibile 054H Magenta XL', 'Toner Compatibili', 'Canon', 18.90, true, ARRAY['Canon LBP621Cw', 'Canon MF641Cw'], 'Toner magenta ad altissimo rendimento per colori brillanti e costanti nel tempo.', '/src/assets/images/toner_compat_cmy_premium_1779959002014.png');`;

    navigator.clipboard.writeText(sqlText);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleInsertSeedData = async () => {
    if (!supabase) return;
    setIsInserting(true);
    setError(null);
    try {
      const demoRows = [
        {
          sku: 'TN-2420-BK',
          name: 'Toner Compatibile TN-2420 Alta Capacità',
          category: 'Toner Compatibili',
          brand: 'Brother',
          price: 14.90,
          availability: true,
          compatibility: ['Brother HL-L2310D', 'Brother MFC-L2710DN'],
          description: 'Toner nero professionale con resa garantita di 3000 pagine al 5% di copertura.',
          image: '/src/assets/images/toner_compat_bk_premium_1779958984462.png'
        },
        {
          sku: 'HP-305XL-COL',
          name: 'Cartuccia Originale HP 305XL Tricolore',
          category: 'Cartucce Originali',
          brand: 'HP',
          price: 24.50,
          availability: true,
          compatibility: ['HP DeskJet 2710', 'HP ENVY 6020'],
          description: 'Cartuccia tricolore originale ad alta capacità per stampe nitide e brillanti.',
          image: '/src/assets/images/inkjet_orig_template_2_1779958733126.png'
        },
        {
          sku: 'CAN-054H-MA',
          name: 'Toner Compatibile 054H Magenta XL',
          category: 'Toner Compatibili',
          brand: 'Canon',
          price: 18.90,
          availability: true,
          compatibility: ['Canon LBP621Cw', 'Canon MF641Cw'],
          description: 'Toner magenta ad altissimo rendimento per colori brillanti e costanti nel tempo.',
          image: '/src/assets/images/toner_compat_cmy_premium_1779959002014.png'
        }
      ];

      const { error: seedError } = await supabase
        .from('products')
        .insert(demoRows);

      if (seedError) throw seedError;
      
      alert("Prodotti di test inseriti con successo!");
      loadProducts();
    } catch (err: any) {
      console.error(err);
      setError("Impossibile caricare i prodotti demo: " + (err.message || "Verifica di aver creato la tabella 'products' nel SQL Editor di Supabase."));
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-150">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Database size={11} className="text-blue-600" /> Supabase Realtime DB
              </span>
              
              {configured ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connesso
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-250 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Chiavi Mancanti
                </span>
              )}
            </div>
            
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Lista Prodotti Supabase
            </h2>
            <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
              Dati caricati live e gestiti in cloud tramite la tabella SQL <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono">products</code> di Supabase.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button 
              onClick={loadProducts}
              className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl text-slate-700 transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-wider"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
              {loading ? "Caricamento..." : "Ricarica"}
            </button>
          </div>
        </div>

        {/* Diagnostic Panel if not configured or empty or throwing errors */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {(!configured || error || (products.length === 0 && !loading)) && (
            <div className="bg-white border border-slate-250 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
              
              {/* Alert Message */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-slate-700">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                    {!configured 
                      ? "Variabili di Ambiente Supabase non Rilevate" 
                      : error 
                        ? "Errore di Connessione o Schema" 
                        : "Nessun Prodotto nella Tabella 'products'"}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500 font-semibold">
                    {!configured 
                      ? "Fornisci NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nelle impostazioni del tuo hosting (Vercel o .env) per attivare la connessione Cloud."
                      : error 
                        ? `Errore dettagliato: ${error}`
                        : "La connessione a Supabase ha avuto successo, ma la tabella 'products' è attualmente vuota oppure non è stata ancora creata o popolata."}
                  </p>
                </div>
              </div>

              {/* Masked Connection details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-1 text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">Tabella cercata</span>
                  <strong className="text-slate-800 font-black">products</strong>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-1 text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">ENDPOINT URL</span>
                  <span className="text-blue-600 font-bold block truncate">{configInfo.url || "Non configurata"}</span>
                </div>
              </div>

              {/* SQL Creator Panel */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900 uppercase">1. Prepara lo schema del database (SQL)</h5>
                    <p className="text-[11px] text-slate-500 font-semibold">Incolla questo codice nel SQL Editor del tuo pannello Supabase per creare la tabella ed inserire dati demo.</p>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                  >
                    {sqlCopied ? (
                      <>
                        <Check size={12} className="text-green-400" />
                        Copiato!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copia SQL schema
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="text-[10px] font-mono p-4 rounded-2xl bg-slate-950 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed text-left max-h-[190px]">
                    {`CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  brand VARCHAR(255),
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  availability BOOLEAN DEFAULT true,
  compatibility TEXT[] DEFAULT '{}',
  description TEXT,
  image TEXT
);`}
                  </pre>
                </div>

                {/* Direct seed button if table does exist */}
                {configured && (
                  <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Inserimento Veloce</span>
                      <p className="text-xs text-slate-500 font-semibold">Se hai già eseguito il codice SQL di sopra per creare la tabella products, clicca qui per popolarla istantaneamente.</p>
                    </div>
                    <button
                      onClick={handleInsertSeedData}
                      disabled={isInserting}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                    >
                      {isInserting ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <ShoppingBag size={13} />
                      )}
                      Carica Record di Prova
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Live Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-150 rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="h-48 bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="pt-4 flex justify-between">
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                  <div className="h-8 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-150 p-6 rounded-3xl hover:shadow-2xl hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onNavigate('product-detail', product)}
              >
                <div>
                  {/* Image & Badges */}
                  <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 mb-6 group-hover:scale-102 transition-transform overflow-hidden relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/toner_compat_bk_premium_1779958984462.png';
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white font-sans text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest shadow">
                      Supabase DB
                    </span>
                    <span className="absolute top-3 right-3 bg-slate-900/90 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded border border-slate-750 tracking-wider">
                      {product.brand}
                    </span>
                  </div>

                  {/* Meta Details */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-tight mb-2">
                    <span>{product.category}</span>
                    <span className="font-mono">{product.sku}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-snug mb-3 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Compatibility Badges */}
                  {product.compatibility && product.compatibility.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase block mb-1.5">Stampanti compatibili</span>
                      <div className="flex flex-wrap gap-1">
                        {product.compatibility.slice(0, 3).map((comp, idx) => (
                          <span key={idx} className="bg-slate-150/70 text-slate-700 text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-md border border-slate-200">
                            {comp}
                          </span>
                        ))}
                        {product.compatibility.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-black self-center pl-1">
                            +{product.compatibility.length - 3} altre
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Short Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">
                    {product.description || "Nessuna descrizione disponibile per questo prodotto Supabase."}
                  </p>
                </div>

                {/* Pricing and Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Prezzo</span>
                    <span className="text-lg font-black text-slate-900">
                      € {Number(product.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2.5">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`font-black text-[10px] uppercase tracking-widest py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        lastAddedId === product.id 
                          ? "bg-emerald-600 text-white shadow-emerald-100"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 hover:shadow-blue-200"
                      }`}
                      title="Aggiungi direttamente al carrello"
                    >
                      {lastAddedId === product.id ? (
                        <>
                          <Check size={12} /> Unito!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={12} /> Aggiungi
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('product-detail', product);
                      }}
                      className="p-2.5 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                      title="Dettagli prodotto"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
};
