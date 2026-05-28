import React from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle2, AlertCircle, Info, ArrowRight, Printer, ShieldCheck, Zap } from 'lucide-react';

export const CompatibilityPage = ({ onBack }: { onBack: () => void }) => {
  const commonIssues = [
    { q: "Il mio toner non viene riconosciuto", a: "Assicurati di aver rimosso la linguetta protettiva arancione e di aver inserito il toner finché non senti un 'click'." },
    { q: "La stampante segnala 'Toner Esaurito' anche se nuovo", a: "Alcuni modelli richiedono un reset del contatore. Consulta il manuale della tua stampante o contattaci via WhatsApp." },
    { q: "Qualità di stampa scarsa o righe sul foglio", a: "Potrebbe essere necessario pulire il tamburo (Drum) o eseguire un ciclo di pulizia testine." }
  ];

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
          >
            ← Torna alla Home
          </button>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="w-16 h-1.5 bg-blue-600 rounded-full" />
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">Guida alla <br/><span className="text-blue-600">Compatibilità</span></h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Ogni prodotto Ink&Print By Denise è rigido testato per garantire il 100% di compatibilità con la tua stampante senza invalidare la garanzia del produttore.
              </p>
            </div>
          </div>
        </div>

        {/* Search Tool Placeholder */}
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden mb-24 shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Verifica Rapida</h2>
            <p className="text-blue-100/60 font-medium mb-8">Inserisci il modello della tua stampante per trovare subito i consumabili compatibili certificati Ink&Print By Denise.</p>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Esempio: HP LaserJet Pro M15w..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-6 pl-16 pr-8 text-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20"
              />
            </div>
          </div>
          <div className="absolute top-1/2 right-20 -translate-y-1/2 hidden lg:block opacity-20">
             <Printer size={300} strokeWidth={0.5} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {[
            {
              title: "Chip Aggiornati",
              desc: "I nostri toner montano sempre l'ultima versione del chip per il monitoraggio dei livelli d'inchiostro.",
              icon: Zap,
              color: "bg-yellow-50 text-yellow-600"
            },
            {
              title: "Nessun Errore di Blocco",
              desc: "Software ottimizzato per superare i controlli firmware più recenti di HP, Epson e Brother.",
              icon: ShieldCheck,
              color: "bg-blue-50 text-blue-600"
            },
            {
              title: "Assistenza Diretta",
              desc: "Se hai dubbi, il nostro team tecnico verifica per te la compatibilità in tempo reale su WhatsApp.",
              icon: Info,
              color: "bg-green-50 text-green-600"
            }
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-xl group">
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase">{item.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Domande Frequenti</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>
          {commonIssues.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
            >
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-600" /> {item.q}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium pl-7">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
