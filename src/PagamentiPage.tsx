import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, FileText, CheckCircle, CreditCard, Copy, Check, 
  Sparkles, Award, Wallet, ArrowLeft, RefreshCw, Send, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PagamentiPageProps {
  onBack: () => void;
}

export const PagamentiPage: React.FC<PagamentiPageProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const ibanString = "IT42 N036 6901 6005 1403 9448 155";

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText(ibanString.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        {/* Navigation Head */}
        <button 
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Torna alla Home
        </button>

        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 border border-green-200 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest">
            <ShieldCheck size={12} className="text-green-600" /> Standard di Sicurezza Elevati (SSL)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">
            Metodi di Pagamento Sicuri
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
            Per garantirti un'esperienza d'acquisto affidabile, supportiamo i migliori circuiti e canali di pagamento mondiali con protocollo crittografato SSL a 256 bit.
          </p>
        </div>

        {/* Security Badge Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Lock, label: "Transazioni SSL", text: "Tutti i dati finanziari sono criptati end-to-end senza transitare dai nostri server." },
            { icon: CheckCircle, label: "Checkout Sicuro", text: "Integrazione API diretta con PayPal e primari gateway bancari europei." },
            { icon: RefreshCw, label: "Elaborazione Rapida", text: "Gli ordini con carta di credito e PayPal vengono sbloccati immediatamente." },
            { icon: ShieldCheck, label: "Protezione Dati", text: "Tutela totale delle credenziali e della privacy del cliente secondo norme GDPR." }
          ].map((sec) => (
            <div key={sec.label} className="bg-white p-5 border border-slate-200 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <sec.icon size={20} />
              </div>
              <h3 className="font-black text-xs text-slate-950 uppercase tracking-tight">{sec.label}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{sec.text}</p>
            </div>
          ))}
        </div>

        {/* Core Payments Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Digital Methods & Cards (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg space-y-8">
            <div className="border-b pb-4">
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Circuiti Digitali Abilitati</h3>
              <p className="text-xs text-slate-400 font-medium font-sans">Scegli la modalità di pagamento digitale che preferisci.</p>
            </div>

            <div className="space-y-6">
              {/* Cards (Visa, Mastercard, Maestro) */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <span className="bg-blue-105 border border-blue-200 text-blue-800 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest leading-none bg-blue-100">
                    Sblocco Immediato
                  </span>
                  <h4 className="font-extrabold text-slate-950 text-sm uppercase">Carte di Credito / Debito</h4>
                  <p className="text-xs text-slate-500 font-semibold leading-none">Accettiamo carte di tutti i principali circuiti.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 h-10 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto object-contain" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 h-10 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto object-contain" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 h-10 flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase text-slate-400 select-none">Maestro</span>
                  </div>
                </div>
              </div>

              {/* PayPal */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <span className="bg-indigo-100 border border-indigo-200 text-blue-700 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest leading-none">
                    Massima Tutela Acquirenti
                  </span>
                  <h4 className="font-extrabold text-slate-950 text-sm uppercase">PayPal Account</h4>
                  <p className="text-xs text-slate-500 font-semibold leading-none">Paga in sicurezza in 3 comode rate senza interessi.</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 h-10 flex items-center justify-center shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 w-auto object-contain" />
                </div>
              </div>

              {/* Debit & Prepaid Cards (Visa Debit, Mastercard Debit, Postepay) */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <span className="bg-purple-100 border border-purple-200 text-purple-800 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest leading-none">
                    Massima Semplicità
                  </span>
                  <h4 className="font-extrabold text-slate-950 text-sm uppercase">Carte di Debito e Prepagate</h4>
                  <p className="text-xs text-slate-500 font-semibold leading-none">Supportiamo carte prepagate Postepay, Visa Debit e Maestro.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 h-10 flex items-center justify-center font-black text-xs text-slate-500 uppercase px-4 select-none">
                    Postepay
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 h-10 flex items-center justify-center font-black text-xs text-slate-500 uppercase px-4 select-none">
                    Visa Debit
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Copyable Bank Wire Details Highlight BOX (5 cols) */}
          <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] border border-blue-200 shadow-lg space-y-6">
            <div className="border-b pb-4">
              <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest leading-none inline-block mb-2">
                METODO CONSIGLIATO AZIENDE
              </span>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Bonifico Bancario</h3>
              <p className="text-xs text-slate-400 font-medium">Ideale per ordini amministrativi e forniture PA.</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Per effettuare acquisti in modalità fatturazione differita o bonifico immediato, utilizza le coordinate bancarie nazionali riportate di seguito.
            </p>

            {/* HIGHLY HIGHLIGHTED COPYABLE BOX */}
            <div className="bg-blue-50/75 border-2 border-blue-200 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-blue-105 pb-3">
                <span className="text-[10px] text-blue-850 font-black uppercase tracking-wider">DATI IBAN AZIENDALI</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">INK&PRINT BY DENISE</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 block uppercase">Codice IBAN Nazionale (Italy)</label>
                <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono font-bold text-xs text-slate-900 select-all shadow-inner">
                  <span className="tracking-tight">{ibanString}</span>
                  <button 
                    onClick={handleCopyIBAN}
                    className="p-2 border bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Copia negli appunti"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Informative list inside box */}
              <div className="text-[10px] text-blue-900 leading-relaxed font-semibold space-y-1 pt-1">
                <p>• <strong>Banca d'appoggio:</strong> Intesa Sanpaolo Milano</p>
                <p>• <strong>Causale suggerita:</strong> Digita sempre il tuo numero d'ordine (es. "Pagamento Ordine PT-10385")</p>
              </div>

              <AnimatePresence>
                {copied && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-500 text-white font-black text-[9px] uppercase py-2 rounded-xl text-center tracking-widest"
                  >
                    ✓ IBAN COPIATO NEGLI APPUNTI DEL DISPOSITIVO
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-[10px] text-slate-500 leading-relaxed text-justify font-bold">
              ℹ️ Gli ordini saldati a mezzo Bonifico Bancario vengono presi in carico in magazzino non appena riceviamo la notifica di addebito (normalmente 24 ore dall'invio contabile bancario).
            </div>
          </div>

        </div>

        {/* Informative Protection Checklist */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-cover bg-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">PROTEGGERE IL NOSTRO CLIENTE È LA REGOLA #1</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Garanzie commerciali Ink&Print By Denise</p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Siamo orgogliosi di applicare una politica orientata alla rassicurazione. Se riscontri qualsiasi problema contabile, addebito non autorizzato o duplicato, il nostro ufficio liquidazioni elabora il rimborso sulla tua carta o conto corrente entro 48 ore lavorative dall'apertura del ticket.
              </p>
            </div>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-semibold leading-relaxed text-slate-400 space-y-3">
              <p className="text-white font-bold block uppercase border-b border-slate-800 pb-2 text-[10px] tracking-widest text-blue-400">CHECKOUT SICURO ATTIVO</p>
              <p>✓ <strong>Sito protetto:</strong> Icona lucchetto e protocollo HTTPS attivi in tutte le fasi di navigazione.</p>
              <p>✓ <strong>Senza conservazione:</strong> Non salvare nè archiviare mai codici CVV/CVC e PIN bancari.</p>
              <p>✓ <strong>Assistenza contabile:</strong> Servizio telefonico h24 dedicato per verifiche repentine transato.</p>
            </div>
        </div>

      </div>
    </div>
  );
};
