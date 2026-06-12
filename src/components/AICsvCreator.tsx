import React, { useState } from 'react';
import { Sparkles, Download, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIProduct {
  id: string;
  name: string;
  price: number;
  compatibility: string[];
  category: string;
  brand: string;
  description: string;
  stock: number;
}

export const AICsvCreator: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAIProcess = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch("/api/ai/parse-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        const parsed: any[] = data.products;
        const formatted: AIProduct[] = parsed.map((p, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          name: p.name || "",
          price: Number(p.price) || 0,
          compatibility: Array.isArray(p.compatibility) ? p.compatibility : [],
          category: p.category || "",
          brand: p.brand || "",
          description: p.description || "",
          stock: Number(p.stock) || 100
        }));
        
        setProducts(formatted);
        setSuccess(`AI ha elaborato correttamente ${formatted.length} prodotti!`);
      } else {
        throw new Error(data.error || "Errore sconosciuto durante l'elaborazione AI.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCell = (id: string, field: keyof AIProduct, value: string | number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        if (field === 'compatibility') {
          return { ...p, compatibility: String(value).split(',').map(s => s.trim()) };
        }
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleAddRow = () => {
    const newProd: AIProduct = {
      id: `manual-${Date.now()}`,
      name: "Nuovo Prodotto",
      price: 0,
      compatibility: [],
      category: "",
      brand: "",
      description: "",
      stock: 0
    };
    setProducts(prev => [...prev, newProd]);
  };

  const handleRemoveRow = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleExportCsv = () => {
    if (products.length === 0) return;
    
    // Header
    let csvContent = "name;price;compatibility;category;description;stock\n";
    
    // Rows
    products.forEach(p => {
      const compatStr = p.compatibility.join(', ');
      const row = [
        `"${p.name.replace(/"/g, '""')}"`,
        p.price.toString().replace('.', ','), // Format for Italian Excel/Prestashop
        `"${compatStr.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        `"${p.description.replace(/"/g, '""')}"`,
        p.stock
      ];
      csvContent += row.join(';') + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `catalogo_generato_ai_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase">AI CSV Creator</h2>
            <p className="text-xs text-slate-500 font-medium">Incolla testi disordinati o cataloghi fornitori per generare un file CSV strutturato.</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Esempio: Toner Brother TN2420 nero compatibile DCP L2530DW HL L2350DW prezzo 6,03 euro disponibile..."
            className="w-full h-48 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl p-4 text-sm font-medium outline-none transition-all resize-none"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {error && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 uppercase">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100 uppercase">
                  <CheckCircle2 size={14} /> {success}
                </div>
              )}
            </div>

            <button
              onClick={handleAIProcess}
              disabled={isProcessing || !inputText.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Elaborazione...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Genera Prodotti
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase">Tabella Prodotti Generata</h3>
                <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{products.length}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-50 transition-all"
                >
                  <Plus size={14} /> Aggiungi Riga
                </button>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                >
                  <Download size={14} /> Esporta CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nome Prodotto</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-24">Prezzo (€)</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Compatibilità (separata da virgola)</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Categoria</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-20">Stock</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 border-b border-slate-100">
                        <input
                          value={p.name}
                          onChange={(e) => handleUpdateCell(p.id, 'name', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded p-1 text-sm font-semibold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => handleUpdateCell(p.id, 'price', Number(e.target.value))}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded p-1 text-sm font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <input
                          value={p.compatibility.join(', ')}
                          onChange={(e) => handleUpdateCell(p.id, 'compatibility', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded p-1 text-xs font-medium text-slate-600 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <input
                          value={p.category}
                          onChange={(e) => handleUpdateCell(p.id, 'category', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded p-1 text-xs font-bold text-slate-600 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <input
                          type="number"
                          value={p.stock}
                          onChange={(e) => handleUpdateCell(p.id, 'stock', Number(e.target.value))}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded p-1 text-sm font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 text-center">
                        <button
                          onClick={() => handleRemoveRow(p.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase mr-auto flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                Puoi modificare ogni riga prima di esportare. Il separatore CSV è ";"
              </p>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                <Download size={18} /> Scarica CSV Catalogo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
