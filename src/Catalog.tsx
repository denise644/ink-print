import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Info, Check, X, ChevronRight, FileUp, ArrowUpDown, Tag, Printer, Layers, Grid, List as ListIcon, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './CartContext.tsx';
import { Product } from './types.ts';
import { ProductCard } from './Components.tsx';

export const Catalog = ({ initialSearch = "", initialCategory = "", onNavigate }: { initialSearch?: string, initialCategory?: string, onNavigate?: (page: string, data?: any) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: initialCategory,
    brand: "",
    search: initialSearch,
    sort: "relevance",
    minPrice: "",
    maxPrice: ""
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [csvText, setCsvText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    setFilters(f => ({ ...f, search: initialSearch, category: initialCategory }));
  }, [initialSearch, initialCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.category) query.append('category', filters.category);
      if (filters.brand) query.append('brand', filters.brand);
      if (filters.search) query.append('search', filters.search);
      if (filters.sort) query.append('sort', filters.sort);
      if (filters.minPrice) query.append('minPrice', filters.minPrice);
      if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);

      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch(`/api/products?${query}`),
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);
      const [prodData, catData, brandData] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        brandRes.json()
      ]);
      setProducts(prodData);
      setCategories(catData);
      setBrands(brandData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleImport = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvText })
      });
      const data = await res.json();
      if (data.success) {
        setImportStatus(`Importazione completata: ${data.count} prodotti aggiunti.`);
        setCsvText("");
        fetchData();
        setTimeout(() => setImportStatus(null), 5000);
      }
    } catch (e) {
      setImportStatus("Errore durante l'importazione.");
    } finally {
      setIsImporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category: "", brand: "", search: "", sort: "relevance", minPrice: "", maxPrice: "" });
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Catalogo Completo</h1>
              <p className="text-slate-500 font-medium">Visualizzazione di {products.length} articoli professionali Ink&Print By Denise.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Cerca per SKU, nome, marca, stampante compatibile o categoria..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-medium"
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Filter size={18} className="text-blue-600" /> Filtri Avanzati
                </h3>
                <button onClick={clearFilters} className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 hover:bg-slate-200 transition-all font-bold">RESET</button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Ordinamento</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-sm font-bold outline-none"
                    value={filters.sort}
                    onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
                  >
                    <option value="relevance">Rilevanza</option>
                    <option value="brand">Marca (A-Z)</option>
                    <option value="price-asc">Prezzo: Crescente</option>
                    <option value="price-desc">Prezzo: Decrescente</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Marche</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-slate-50 rounded">
                        <input 
                          type="radio" 
                          name="brand"
                          checked={filters.brand === brand}
                          onChange={() => setFilters(f => ({ ...f, brand }))}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className={`text-sm ${filters.brand === brand ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Categorie</label>
                  <div className="space-y-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-slate-50 rounded">
                        <input 
                          type="radio" 
                          name="category"
                          checked={filters.category === cat}
                          onChange={() => setFilters(f => ({ ...f, category: cat }))}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className={`text-sm ${filters.category === cat ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>


          </aside>

          {/* Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 h-96 animate-pulse border border-slate-100" />
                ))
              ) : products.length > 0 ? (
                products.map((p) => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))
              ) : (!filters.category && !filters.brand && !filters.search && !filters.minPrice && !filters.maxPrice) ? (
                <div className="col-span-full p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-3xl text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-red-900 uppercase tracking-tight mb-2">Errore di Connessione o Database Vuoto</h3>
                  <p className="text-red-700 font-medium max-w-xl mx-auto mb-6">
                    Gentile Utente, la tabella <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-red-800 font-black">products</code> sul tuo database Supabase risulta attualmente vuota o non raggiungibile.
                  </p>
                  <p className="text-slate-600 text-sm max-w-lg mx-auto mb-8 font-medium">
                    Questo sito è completamente collegato a Supabase in tempo reale. Per popolare la tabella d'acquisto, utilizza la casella "Sincronizzazione Catalogo" che trovi qui sotto per incollare e importare il CSV del listino ufficiale!
                  </p>
                </div>
              ) : (
                <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Nessun prodotto trovato</h3>
                  <button onClick={clearFilters} className="text-blue-600 font-bold hover:underline">Resetta i filtri</button>
                </div>
              )}
            </div>

            {/* CSV Import at bottom */}
            <div className="mt-12 p-8 bg-white rounded-3xl border border-slate-200">
               <h3 className="text-xl font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                 <FileUp className="text-blue-600" /> Sincronizzazione Catalogo
               </h3>
               <p className="text-slate-500 text-sm mb-6">Caricamento massivo tramite CSV per aggiornare i 1536 prodotti del listino ufficiale.</p>
               <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[10px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none mb-4"
                  placeholder="sku,name,category,brand,price,availability,compatibility,description,image"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
                <button 
                  onClick={handleImport}
                  disabled={isImporting || !csvText.trim()}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  {isImporting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><FileUp size={18} /></motion.div> : <FileUp size={18} />}
                  Sincronizza Catalogo CSV
                </button>
                {importStatus && <p className="mt-4 text-green-600 font-bold text-sm">{importStatus}</p>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
