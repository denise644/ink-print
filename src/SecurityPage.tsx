import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Truck, CreditCard, ChevronRight, CheckCircle2, Award, Headset } from 'lucide-react';

export const SecurityPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="pt-32 pb-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
        >
          ← Torna alla Home
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="w-16 h-1.5 bg-blue-600 rounded-full" />
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                Acquista in <br/><span className="text-blue-600">Sicurezza Totale</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                In Ink&Print By Denise, la tua sicurezza è la nostra priorità. Utilizziamo i protocolli di crittografia più avanzati per proteggere ogni transazione e garantiamo spedizioni veloci e tracciabili.
              </p>
            </div>
            
            <div className="space-y-6">
               {[
                 { title: "Pagamenti Crittografati SSL", desc: "Tutte le transazioni avvengono su server sicuri certificati EV-SSL a 256 bit.", icon: Lock },
                 { title: "Metodi di Pagamento Protetti", desc: "Scegli tra PayPal, Carte di Credito, Bonifico Bancario o Contrassegno.", icon: CreditCard },
                 { title: "Protezione Acquisto", desc: "Se il prodotto non arriva o è danneggiato, sei protetto dal rimborso totale.", icon: Shield }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 text-blue-600">
                     <item.icon size={22} />
                   </div>
                   <div>
                     <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.title}</h3>
                     <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 lg:p-12 border border-slate-100">
               <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
                 <Truck className="text-blue-600" /> Spedizioni Express
               </h2>
               <div className="space-y-10">
                 <div className="flex justify-between items-start">
                   <div className="space-y-1">
                     <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Preparazione Ordine</p>
                     <p className="text-sm font-medium text-slate-500">Gli ordini entro le 14:00 partono in giornata.</p>
                   </div>
                   <div className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Fast Track</div>
                 </div>
                 
                 <div className="relative pl-8 border-l-2 border-slate-100 space-y-10">
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm" />
                      <p className="font-bold text-sm text-slate-900">Corriere Espresso BRT / GLS</p>
                      <p className="text-xs text-slate-500 font-medium">Consegna stimata in 24/48 ore lavorative.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 bg-slate-200 rounded-full border-4 border-white shadow-sm" />
                      <p className="font-bold text-sm text-slate-400">Tracking Ordine Live</p>
                      <p className="text-xs text-slate-400 font-medium">Ricevi un SMS appena la merce lascia il magazzino.</p>
                    </div>
                 </div>

                 <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between group cursor-pointer hover:bg-blue-600 transition-colors">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Costi Spedizione</p>
                      <p className="font-bold">Gratuita sopra i 150€</p>
                    </div>
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Guarantees */}
        <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-white grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { icon: Award, label: "Qualità Oro", desc: "Prodotti certificati ISO 9001/14001" },
            { icon: CheckCircle2, label: "Toner Gold", desc: "Test di stampa su ogni lotto" },
            { icon: Headset, label: "Supporto 24/7", desc: "Ti rispondiamo in meno di 2h" },
            { icon: Shield, label: "Garanzia 36 Mesi", desc: "Più del doppio della normale garanzia" }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                  <item.icon size={32} />
               </div>
               <h4 className="font-black text-sm uppercase tracking-widest">{item.label}</h4>
               <p className="text-xs text-blue-100 font-medium opacity-60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
