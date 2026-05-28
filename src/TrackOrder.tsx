import React, { useState } from 'react';
import { Search, Package, MapPin, Truck, CheckCircle2, Clock, AlertCircle, Mail, Phone, ExternalLink, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderInfo {
  orderNumber: string;
  date: string;
  status: 'received' | 'processing' | 'shipped' | 'delivering' | 'delivered';
  shippingMethod: string;
  carrier: string;
  trackingCode: string;
  trackingUrl: string;
  items: string[];
  customer?: any; // Added for delivery note
}

export const TrackOrder = ({ onNavigate }: { onNavigate?: (page: string, data?: any) => void }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    // Simulate API call
    try {
      const response = await fetch(`/api/track-order?number=${orderNumber}&email=${email}`);
      if (!response.ok) {
        throw new Error('Ordine non trovato. Verifica numero ordine ed email oppure contatta l’assistenza clienti.');
      }
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending_payment', label: 'In attesa di pagamento', icon: Clock },
    { key: 'received', label: 'Pagamento Ricevuto', icon: CheckCircle2 },
    { key: 'processing', label: 'In Preparazione', icon: Package },
    { key: 'shipped', label: 'Spedito / In Viaggio', icon: MapPin },
    { key: 'delivered', label: 'Consegnato', icon: CheckCircle2 },
  ];

  const currentStatusIndex = order ? statusSteps.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="text-white" size={32} />
            </div>
            <span className="text-4xl font-black tracking-tighter text-slate-900 uppercase">PRO<span className="text-blue-600">TONER</span> HUB</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TRACCIA IL TUO ORDINE</h1>
          <p className="text-slate-500 max-w-xl mx-auto">Inserisci i dati della tua conferma d'ordine per monitorare lo stato della spedizione in tempo reale.</p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleTrack} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Numero Ordine</label>
              <input 
                type="text" 
                required
                placeholder="es. PT-12345"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-bold"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email di acquisto</label>
              <input 
                type="email" 
                required
                placeholder="tua@email.it"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 pt-4">
              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? 'Ricerca in corso...' : (
                  <>
                    <Search size={22} /> VERIFICA STATO ORDINE
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-700"
            >
              <AlertCircle className="shrink-0" />
              <p className="font-bold">{error}</p>
            </motion.div>
          )}

          {order && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Order Status Timeline */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-x-auto">
                <div className="flex justify-between items-start min-w-[600px]">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative flex-1">
                        {/* Line */}
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute top-6 left-1/2 w-full h-1 -z-0 ${index < currentStatusIndex ? 'bg-blue-600' : 'bg-slate-100'}`} />
                        )}
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon size={24} />
                        </div>
                        <div className={`mt-4 text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="mt-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Stato Attuale</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Package className="text-blue-600" size={20} /> Informazioni Ordine
                  </h3>
                  <div className="space-y-4 text-sm font-medium">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-400">Data Ordine:</span>
                      <span className="text-slate-900">{order.date}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-400">Metodo Spedizione:</span>
                      <span className="text-slate-900">{order.shippingMethod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-400">Corriere:</span>
                      <span className="text-slate-900 font-bold text-blue-600">{order.carrier}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-400">Contenuto:</span>
                      <span className="text-slate-900 text-right">
                        {Array.isArray(order.items) && typeof order.items[0] === 'object' 
                          ? (order.items as any[]).map((i: any) => i.name).join(', ') 
                          : order.items.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl shadow-lg text-white space-y-6">
                  <h3 className="font-black uppercase tracking-wider flex items-center gap-2">
                    < Truck className="text-blue-400" size={20} /> Tracking Spedizione
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Codice Tracking</p>
                      <p className="text-2xl font-mono font-black text-white">{order.trackingCode}</p>
                    </div>
                    <div className="pt-4 space-y-3">
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40"
                      >
                        VAI SUL SITO DEL CORRIERE <ExternalLink size={18} />
                      </a>
                      <button 
                        onClick={() => onNavigate?.('bolla', order)}
                        className="bg-white text-slate-900 border-2 border-slate-800 hover:bg-slate-50 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        SCARICA BOLLA SPEDIZIONE <FileDown size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Section */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left space-y-2">
              <h4 className="text-xl font-black text-slate-900">SERVE ASSISTENZA?</h4>
              <p className="text-slate-500 text-sm">I nostri operatori sono pronti ad aiutarti per qualsiasi dubbio sulla tua spedizione.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:support@inkprint.it" className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-all">
                <Mail size={18} /> support@inkprint.it
              </a>
              <a href="tel:+390123456789" className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 px-6 py-3 rounded-xl font-bold hover:bg-green-100 transition-all">
                <Phone size={18} /> +39 0123 456789
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
