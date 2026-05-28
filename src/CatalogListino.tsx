import React, { useEffect, useState } from 'react';
import { Download, FileText, Loader2, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  compatibility: string[];
  description: string;
}

export const CatalogListino = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const groupedProducts = products.reduce((acc: any, p) => {
    if (!acc[p.brand]) acc[p.brand] = [];
    acc[p.brand].push(p);
    return acc;
  }, {});

  const filteredBrands = Object.keys(groupedProducts)
    .filter(brand => brand.toLowerCase() !== 'generic')
    .sort();

  const handleCopy = () => {
    const text = document.getElementById('listino-content')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Catalogo copiato! Ora puoi incollarlo in Microsoft Word.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Listino Professionale</h1>
          <p className="text-slate-500">Ottimizzato per la stampa e per il passaggio a software di videoscrittura (Word).</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleCopy}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Download size={20} /> Copia per Word
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-100 mb-12">
        <div id="listino-content" className="space-y-12 font-serif text-slate-900 whitespace-pre-wrap leading-relaxed">
          {filteredBrands.map(brand => (
            <div key={brand} className="space-y-8 border-b-2 border-slate-50 pb-12 last:border-0 last:pb-0">
              <h2 className="text-4xl font-bold border-l-8 border-blue-600 pl-6 mb-8 uppercase tracking-widest">{brand}</h2>
              
              <div className="grid gap-10">
                {groupedProducts[brand].map((product: Product) => (
                  <div key={product.id} className="group relative">
                    <div className="text-xl font-black text-slate-800 mb-1">{product.name}</div>
                    <div className="text-2xl font-bold text-blue-700 bg-blue-50/50 inline-block px-3 py-1 rounded-lg mb-3">
                      Prezzo: {product.price.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    </div>
                    {product.compatibility.length > 0 && (
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-bold text-slate-900">Compatibilità: </span> 
                        {product.compatibility.join(', ')}
                      </div>
                    )}
                    {product.description && (
                      <div className="text-sm text-slate-500 italic">
                        <span className="font-bold text-slate-800 not-italic">Descrizione: </span> 
                        {product.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] text-center space-y-4">
        <h3 className="text-2xl font-bold">Hai bisogno di un formato diverso?</h3>
        <p className="text-slate-400">Contatta il nostro supporto tecnico per listini personalizzati in CSV o Excel.</p>
        <div className="pt-4">
          <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all">
            Contatta Assistenza
          </button>
        </div>
      </div>
    </div>
  );
};
