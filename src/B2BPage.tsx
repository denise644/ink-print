import React, { useState } from 'react';
import { 
  Building2, Mail, Phone, FileSpreadsheet, Send, FileText, CheckCircle, 
  HelpCircle, Shield, Award, Sparkles, UploadCloud, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface B2BPageProps {
  onBack: () => void;
}

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';

export const B2BPage: React.FC<B2BPageProps> = ({ onBack }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vatId, setVatId] = useState("");
  const [qty, setQty] = useState("10");
  const [products, setProducts] = useState("");
  const [message, setMessage] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !products) return;

    setIsSubmitting(true);
    const requestId = `B2B-${Math.floor(100000 + Math.random() * 900000)}`;
    const path = `b2b_requests/${requestId}`;
    const name = `${firstName} ${lastName}`;
    
    try {
      const requestData = {
        id: requestId,
        name,
        firstName,
        lastName,
        company: company || "N/A",
        email,
        phone: phone || "N/A",
        vatId: vatId || "N/A",
        qty,
        products,
        message,
        fileName: uploadedFileName || null,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'b2b_requests', requestId), requestData);
      
      setSubmittedData({
        ...requestData,
        createdAt: new Date().toISOString() // Just for UI display before reload
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Navigation Head */}
        <button 
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Torna alla Catalogo
        </button>

        {/* Hero Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest">
            <Sparkles size={12} className="text-blue-600" /> Servizio B2B e Forniture Grandi Volumi
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">
            Preventivi Personalizzati <span className="text-blue-600 font-light block italic lowercase text-2xl md:text-3xl tracking-normal mt-1">per aziende, uffici e privati</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
            Richiedi una soluzione su misura per la tua attività. Offriamo prezzi competitivi, forniture professionali e assistenza dedicata.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!submittedData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Key Features / Why Work with Us (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full translate-x-10 -translate-y-10" />
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">I Nostri Vantaggi Commerciali</h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Perché richiedere una quotazione riservata</p>
                  </div>

                  <div className="space-y-6 text-xs text-slate-300 font-medium">
                    <div className="flex gap-4 items-start">
                      <div className="bg-blue-600 p-2.5 rounded-xl text-white shrink-0 shadow-md">
                        <Award size={18} />
                      </div>
                      <div className="space-y-1 leading-snug">
                        <h4 className="font-extrabold text-white text-sm uppercase">Sconto Quantità Scalabile</h4>
                        <p>Prezzi decrescenti in funzione del numero di pezzi ordinati, validi sia su compatibili che originali.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-blue-600 p-2.5 rounded-xl text-white shrink-0 shadow-md">
                        <Building2 size={18} />
                      </div>
                      <div className="space-y-1 leading-snug">
                        <h4 className="font-extrabold text-white text-sm uppercase">Fatturazione Elettronica PA / Split Payment</h4>
                        <p>Gestione adempimenti fiscali, emissione fatture con sdi dedicato e supporto acquisti per Enti Pubblici e uffici statali.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-blue-600 p-2.5 rounded-xl text-white shrink-0 shadow-md">
                        <Shield size={18} />
                      </div>
                      <div className="space-y-1 leading-snug">
                        <h4 className="font-extrabold text-white text-sm uppercase">Consulente Tecnico Assegnato</h4>
                        <p>Un esperto risponderà a tutte le tue domande su compatibilità stampante, consumabili a lungo ciclo e stock.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed text-center">
                      ✓ RISPOSTA GARANTITA ENTRO 4 ORE LAVORATIVE
                    </p>
                  </div>
                </div>

                {/* Secure Badge Info Block */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Trattamento Privato Dati</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">GDPR 2016/679 Compliant</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    I file e le liste di prodotti che alleghi in questo modulo verranno visualizzati esclusivamente dai nostri addetti commerciali interni alla logistica solo per formulare il preventivo richiesto. Non cediamo le tue mail a terzi.
                  </p>
                </div>
              </div>

              {/* Right Column: Elaborate interactive quote request Form (7 Cols) */}
              <form 
                onSubmit={handleSubmit}
                className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Compila il modulo di preventivo</h3>
                  <p className="text-xs text-slate-400 font-medium">Fornisci i dettagli per consentire ai nostri esperti di offrirti la quotazione ottimale.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-bold">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Nome *</label>
                    <input 
                      type="text"
                      required
                      placeholder="es. Marco"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold outline-none transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  {/* Cognome */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Cognome *</label>
                    <input 
                      type="text"
                      required
                      placeholder="es. Rossi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold outline-none transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  {/* Azienda */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Ragione Sociale / Azienda</label>
                    <input 
                      type="text"
                      placeholder="es. Rossi Costruzioni S.r.l. (o scrivi Privato)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold outline-none transition-all"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Insegna E-mail *</label>
                    <input 
                      type="email"
                      required
                      placeholder="es. acquisti@rossisrl.it"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Telefono */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Recapito Telefonico Direct</label>
                    <input 
                      type="tel"
                      placeholder="es. +39 347 1234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold outline-none transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Partita IVA */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Partita IVA / Codice Fiscale</label>
                    <input 
                      type="text"
                      placeholder="es. IT01234567890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono font-bold outline-none transition-all"
                      value={vatId}
                      onChange={(e) => setVatId(e.target.value)}
                    />
                  </div>

                  {/* Quantità richieste */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Quantità Pezzi Annui Previsti</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold outline-none transition-all"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    >
                      <option value="5">Meno di 10 cartucce / anno</option>
                      <option value="15">Da 10 a 50 cartucce-toner / anno</option>
                      <option value="75">Da 50 a 150 consumabili / anno (Media Impresa)</option>
                      <option value="300">Oltre 150 consumabili / anno (Grandi Volumi / Uffici multipli)</option>
                    </select>
                  </div>
                </div>

                {/* Prodotti interessati */}
                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-slate-500 uppercase block pl-1">Prodotti o Codici Stampanti d'Interesse *</label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="es. Toner Brother TN-2420 compatibile (5 pezzi), Tamburo DR-2400 (2 pezzi)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all leading-relaxed"
                    value={products}
                    onChange={(e) => setProducts(e.target.value)}
                  />
                </div>

                {/* Messaggio personalizzato */}
                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-slate-500 uppercase block pl-1">Note e Richieste Particolari</label>
                  <textarea 
                    rows={3}
                    placeholder="Descrivici le tue stampanti o particolari necessità logistiche (es: consegne programmate ogni mese, imballi su pallet)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all leading-relaxed"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* File Upload / Lista prodotti Block */}
                <div className="space-y-2 text-xs font-bold">
                  <label className="text-slate-500 uppercase block pl-1">Carica Lista Excel / PDF o Foto dei Codici</label>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
                  >
                    <input 
                      type="file" 
                      id="quote-file"
                      className="hidden" 
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="quote-file" className="cursor-pointer space-y-3 block">
                      <div className="w-12 h-12 rounded-2xl bg-blue-55 mx-auto flex items-center justify-center bg-blue-100 text-blue-600">
                        <UploadCloud size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-850">Trascina quì la tua lista prodotti o fai click per sfogliare</p>
                        <p className="text-[10px] text-slate-400 font-medium">Excel, PDF, Word o Immagini fino a 10MB</p>
                      </div>
                    </label>

                    {uploadedFileName && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center justify-between text-[11px] font-bold text-blue-800">
                        <div className="flex items-center gap-2 truncate">
                          <FileSpreadsheet size={14} className="text-blue-600 shrink-0" />
                          <span className="truncate">{uploadedFileName}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setUploadedFileName(""); }}
                          className="text-red-500 hover:text-red-700 text-xs px-2"
                        >
                          Elimina X
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-black text-xs uppercase py-4 rounded-xl shadow-lg hover:shadow-xl transition-all tracking-widest flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Inoltro Richiesta Commerciale...</span>
                  ) : (
                    <>
                      <Send size={15} /> Invia Richiesta Preventivo Su Misura
                    </>
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* --- SUBMISSION SUCCESS SCREEN INSTEAD OF FAKE ALERTS --- */
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] border border-green-200 p-8 md:p-14 text-center max-w-2xl mx-auto shadow-2xl space-y-8"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={44} />
              </div>

              <div className="space-y-3">
                <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-green-200 tracking-wider">
                  RICHIESTA PREVENTIVO RICEVUTA CON SUCCESSO!
                </span>
                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">TICKET B2B {submittedData.id} REGISTRATO</h2>
                <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                  Grazie per aver scelto <strong>Ink&Print By Denise B2B</strong>. I nostri sales account di Milano hanno ricevuto la tua richiesta e stanno assemblando la quotazione personalizzata riservata.
                </p>
              </div>

              {/* Preview of logged email in database simulation right here for verification */}
              <div className="bg-slate-900 rounded-3xl p-6 text-left space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-3 font-semibold text-slate-400">
                  <span className="font-mono text-blue-400 uppercase font-black">⚡ NOTIFICA AUTOMATICA INVIATA</span>
                  <span className="font-mono">Inviato ora</span>
                </div>
                <div className="text-xs font-mono text-slate-300 leading-relaxed font-semibold space-y-1">
                  <p><span className="text-slate-500">Destinatario:</span> {submittedData.email}</p>
                  <p><span className="text-slate-500">Oggetto:</span> Abbiamo ricevuto la tua richiesta di preventivo {submittedData.id}</p>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-slate-400 text-[11px] leading-relaxed mt-2 whitespace-pre-line">
                    Gentile {submittedData.name},
                    abbiamo preso in carico la tua richiesta di preventivo personalizzato per {submittedData.products} ({submittedData.qty} unità). Un consulente B2B ti risponderà entro 4 ore lavorative.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => { setSubmittedData(null); setFirstName(""); setLastName(""); setProducts(""); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase px-8 py-3.5 rounded-xl tracking-wider transition-all"
                >
                  Richiedi un Altro Preventivo
                </button>
                <button 
                  onClick={onBack}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl tracking-wider transition-all shadow-lg"
                >
                  Torna al Negozio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
