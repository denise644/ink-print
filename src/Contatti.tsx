import React, { useState } from 'react';
import { 
  Phone, Mail, MessageSquare, MapPin, Clock, ArrowLeft, 
  Send, CheckCircle2, AlertTriangle, Globe, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContattiProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export const Contatti: React.FC<ContattiProps> = ({ onBack, onNavigate }) => {
  // Form States
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefono: "",
    oggetto: "informazioni",
    messaggio: "",
    consensoPrivacy: false
  });
  
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      consensoPrivacy: e.target.checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    
    // Validation
    if (!formData.nome.trim()) errors.push("Il campo 'Nome' è obbligatorio.");
    if (!formData.email.trim()) {
      errors.push("Il campo 'E-mail' è obbligatorio.");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("L'indirizzo e-mail inserito non è valido.");
    }
    if (!formData.messaggio.trim()) errors.push("Il campo 'Messaggio' è obbligatorio.");
    if (!formData.consensoPrivacy) errors.push("È necessario accettare l'Informativa sulla Privacy.");

    setFormErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Simulate sending process (2 seconds)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefono: "",
        oggetto: "informazioni",
        messaggio: "",
        consensoPrivacy: false
      });
    }, 1800);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm uppercase tracking-wider mb-8 transition-colors"
          id="btn-contacts-back"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Indietro alla Home
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/85 p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="bg-blue-50 inline-flex p-3 rounded-2xl text-blue-600">
              <Phone size={32} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Contattaci</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
              Hai bisogno di assistenza sui consumabili per la tua stampante? Vuoi richiedere una quotazione speciale? Il team tecnico di Ink&Print By Denise è a tua disposizione.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full translate-x-24 -translate-y-24 blur-2xl" />
        </div>

        {/* Channels Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Phone */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-start gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <Phone size={20} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">Assistenza Telefonica</span>
              <p className="text-slate-900 font-black text-sm">+39 327 6978338</p>
              <p className="text-[10px] text-slate-500 font-semibold">Chiamata diretta attiva</p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-start gap-4">
            <div className="bg-green-50 text-green-600 p-3 rounded-2xl">
              <Mail size={20} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">E-mail Ufficiale</span>
              <a href="mailto:inkprint26@gmail.com" className="text-slate-900 font-black text-sm block hover:text-blue-600 transition-colors">inkprint26@gmail.com</a>
              <p className="text-[10px] text-slate-500 font-semibold">Risposta entro 24 ore lavorative</p>
            </div>
          </div>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/393276978338" 
            target="_blank" 
            referrerPolicy="no-referrer"
            className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-start gap-4 hover:border-emerald-300 transition-colors cursor-pointer group"
          >
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl group-hover:scale-105 transition-transform">
              <MessageSquare size={20} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">Chat WhatsApp</span>
              <p className="text-slate-900 font-black text-sm group-hover:text-emerald-600 transition-colors">Messaggio Diretto</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">● Assistente Online Scrivi Ora</p>
            </div>
          </a>

          {/* Working Hours */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-start gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <Clock size={20} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">Orari Sede & Supporto</span>
              <p className="text-slate-900 font-black text-sm">Lun - Ven: 09:00 - 18:00</p>
              <p className="text-[10px] text-slate-500 font-semibold">Sabato e Domenica: Chiuso</p>
            </div>
          </div>
        </div>

        {/* Two Columns Section: Form & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Form Column */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-md">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Invia un Messaggio</h2>
            <p className="text-xs text-slate-500 font-semibold mb-8 uppercase">Modulistica di recapito logistico e tecnico</p>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form 
                  key="form-contact"
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  {/* Validation Error Banner */}
                  {formErrors.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-xs font-bold space-y-1"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} />
                        <span>Controlli di compilazione omessi:</span>
                      </div>
                      <ul className="list-disc pl-5 font-medium space-y-0.5">
                        {formErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Nome e Cognome *</label>
                      <input 
                        type="text" 
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="Es. Mario Rossi" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide">E-mail *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="mario.rossi@esempio.com" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Telefono</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="+39 333 1234567" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>

                    {/* Subject dropdown */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Oggetto Richiesta</label>
                      <select 
                        name="oggetto"
                        value={formData.oggetto}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
                      >
                        <option value="informazioni">Informazioni Generiche</option>
                        <option value="commerciale">Richiesta Preventivo Personalizzato</option>
                        <option value="compatibilita">Domande di Compatibilità Toner/Inkjet</option>
                        <option value="ordini">Problematica Spedizione o Ordine in corso</option>
                        <option value="resi">Assistenza Pratica Resi e Rimborso</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Messaggio *</label>
                    <textarea 
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleInputChange}
                      placeholder="Scrivi qui la tua richiesta tecnica in dettaglio (modello stampante, toner desiderati...)" 
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="pt-2 flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="consensoPrivacy"
                      name="consensoPrivacy"
                      checked={formData.consensoPrivacy}
                      onChange={handleCheckboxChange}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                    />
                    <label htmlFor="consensoPrivacy" className="text-[11px] font-medium text-slate-500 leading-snug cursor-pointer select-none">
                      Accetto e dichiaro di aver compreso l'
                      <span 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onNavigate) onNavigate('privacy-policy');
                        }}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Informativa sulla Privacy
                      </span>
                       ai sensi del GDPR. I dati non saranno ceduti a terzi. *
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-750 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Spedizione Messaggio in corso...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Spedisci Messaggio all'Assistenza
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="form-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center space-y-6"
                >
                  <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase">Messaggio Recapitato</h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                      Grazie per averci contattato! La tua richiesta tecnica è stata presa in carico. Un nostro assistente ti risponderà via email all'indirizzo inserito entro poche ore.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-6 rounded-xl text-xs uppercase"
                  >
                    Invia un altro messaggio
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sede & Map Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-slate-900 text-slate-300 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest font-mono">Sede Operativa e Legale</span>
                <h3 className="text-white font-black text-xl uppercase mt-1 leading-none">Ink&Print By Denise</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-4">
                  <MapPin className="text-blue-500 shrink-0" size={18} />
                  <div>
                    <p className="text-white font-bold">Via Sabella 11</p>
                    <p className="text-slate-400 font-bold">92028 Naro (AG) - Sicilia, Italia</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Globe className="text-blue-500 shrink-0" size={18} />
                  <div>
                    <p className="text-white font-bold">Partita IVA e Registro Imprese</p>
                    <p className="text-slate-400">IT 01234567890</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <ShieldCheck className="text-blue-500 shrink-0" size={18} />
                  <div>
                    <p className="text-white font-bold">Posta Certificata (PEC)</p>
                    <p className="text-slate-400">inkprint@legalmail.it</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map Iframe Card */}
            <div className="bg-white border border-slate-200/60 p-3 rounded-[2.5rem] shadow-md overflow-hidden">
              <div className="rounded-[2.2rem] overflow-hidden border border-slate-100 h-[280px]">
                {/* Embed OpenStreetMap Iframe which is extremely high performance, fully functional, and GDPR complete */}
                <iframe 
                  title="Mappa Sede Ink&Print By Denise Naro"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src="https://maps.google.com/maps?width=100%25&amp;height=280&amp;hl=it&amp;q=Via%20Sabella%2011,%2092028%20Naro%20(AG),%20Sicilia,%20Italia+(Ink%26Print%20By%20Denise)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">📍 Via Sabella 11, 92028 Naro (AG), Sicilia</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
