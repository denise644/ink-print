import React, { useState, useEffect } from 'react';
import { Cookie, ArrowLeft, Check, ShieldCheck, Cog, Eye, HelpCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CookiePolicyProps {
  onBack: () => void;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack }) => {
  // Read state from localStorage or default
  const [preferences, setPreferences] = useState({
    technical: true, // Always true
    analytics: true,
    marketing: false
  });
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cookie-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({
          technical: true, // Safeguard
          analytics: !!parsed.analytics,
          marketing: !!parsed.marketing
        });
      } catch (e) {
        // use default
      }
    }
  }, []);

  const handleToggle = (key: 'analytics' | 'marketing') => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    // Trigger dispatch for the global consent banner to capture the change
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShowSavedAnimation(true);
    setTimeout(() => {
      setShowSavedAnimation(false);
    }, 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm uppercase tracking-wider mb-8 transition-colors"
          id="btn-cookies-back"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Indietro alla Home
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="bg-amber-100 inline-flex p-3 rounded-2xl text-amber-600">
              <Cookie size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Informativa sui Cookie</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Il sito Ink&Print By Denise utilizza i cookie per offrire un'esperienza di navigazione personalizzata, sicura e funzionale. Di seguito puoi scegliere in modo granulare quali categorie di tracciamento abilitare.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono font-bold uppercase">
              REVISIONATO IL: 22 Maggio 2026
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/20 rounded-full translate-x-16 -translate-y-16 blur-xl" />
        </div>

        {/* Custom Preferences Dashboard Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-8 shadow-md mb-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <Cog className="text-blue-600" size={24} />
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Centro Preferenze Consenso Cookie</h2>
          </div>

          <div className="space-y-6">
            {/* Technical cookies */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">Cookie Tecnici Necessari (Sempre Attivi)</h3>
                  <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Obbligatorio</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Questi cookie sono indispensabili per il funzionamento generale della piattaforma. Consentono la gestione delle sessioni di e-commerce, il salvataggio dei toner e delle cartucce all'interno del carrello e la persistenza dei moduli di invio. Senza di essi l'acquisto non è tecnicamente praticabile.
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100">ATTIVI</span>
              </div>
            </div>

            {/* Analytics cookies */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">Cookie Statistici e Analytics (Anonimi)</h3>
                  <span className="bg-gray-100 text-gray-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Prestazioni</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ci permettono di contare le visite complessive degli utenti e analizzare le sorgenti di traffico principali per misurare e migliorare le prestazioni del nostro catalogo. Tutti i dati sono raccolti in forma totalmente aggregata e anonima.
                </p>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => handleToggle('analytics')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative ${preferences.analytics ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.analytics ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Marketing cookies */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">Cookie di Profilazione e Marketing</h3>
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Social & Ads</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Vengono utilizzati per proporti annunci pubblicitari pertinenti ai tuoi interessi, tracciare conversioni pubblicitarie e abilitare l'interazione con widget social esterni o video dimostrativi integrati nel nostro catalogo.
                </p>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => handleToggle('marketing')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative ${preferences.marketing ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.marketing ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">ID Tracciamento Sessione Anonimo: pro_cookies_tok_2026</span>
            <button 
              onClick={handleSavePreferences}
              className="bg-blue-600 hover:bg-blue-750 text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md focus:ring-4 focus:ring-blue-100"
            >
              Salva Configurazione Scelta
            </button>
          </div>

          {/* Success Dialog Animation */}
          {showSavedAnimation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 text-green-700 flex items-center gap-2 text-xs font-bold"
            >
              <CheckCircle size={16} />
              Preferenze aggiornate correttamente! Le tue modifiche sono state memorizzate nel browser in tempo reale.
            </motion.div>
          )}
        </div>

        {/* Detailed Explanation Sections */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 md:p-8">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
              <Eye size={18} className="text-blue-500" /> Cos'è un Cookie?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Un cookie è un piccolo file di testo memorizzato nel computer o dispositivo mobile dell'utente quando si visita un sito web. Consente al server del sito di salvare informazioni relative a precedenti accessi, impostazioni linguistiche, credenziali criptate ed elementi aggiunti al carrello. Questo evita di dover inserire nuovamente le stesse preferenze ad ogni nuova pagina caricata o sessione di ritorno.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 md:p-8">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" /> Come Disattivare i Cookie dal Browser?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Oltre a configurare il nostro pannello di gestione consenso, puoi disabilitare o eliminare storicamente i cookie agendo direttamente sulle proprietà di sicurezza e privacy del tuo browser personale:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-500 mt-3 space-y-1 pl-2">
              <li><strong>Google Chrome:</strong> Impostazioni &gt; Privacy e Sicurezza &gt; Cookie e altri dati dei siti.</li>
              <li><strong>Mozilla Firefox:</strong> Opzioni &gt; Privacy e Sicurezza &gt; Cookie e dati dei siti web.</li>
              <li><strong>Apple Safari:</strong> Preferenze &gt; Privacy &gt; Rimuovi tutti i dati dei siti web.</li>
              <li><strong>Microsoft Edge:</strong> Impostazioni &gt; Autorizzazioni sito &gt; Cookie e dati salvati.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
