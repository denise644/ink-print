import React, { useState } from 'react';
import { 
  Users, Briefcase, Mail, Phone, UploadCloud, MapPin, ArrowLeft, 
  Send, FileText, CheckCircle, Smartphone, Award, Network 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LavoraConNoiProps {
  onBack: () => void;
}

export const LavoraConNoi: React.FC<LavoraConNoiProps> = ({ onBack }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("magazzino");
  const [message, setMessage] = useState("");
  
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [uploadedCVName, setUploadedCVName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

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
      setUploadedCV(file);
      setUploadedCVName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedCV(file);
      setUploadedCVName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !position) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          position,
          message,
          fileName: uploadedCVName || "Mio_Curriculum_Vitae.pdf"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionSuccess(data.application);
      }
    } catch (err) {
      console.error(err);
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
          Torna alla Home
        </button>

        {/* Hero Banner Head */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-850 border border-indigo-200 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest">
            <Users size={12} className="text-indigo-600 animate-pulse" /> Carriere e Talenti
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">
            Entra nel Nostro Team
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
            Siamo sempre alla ricerca di persone motivate, dinamiche e appassionate di tecnologia ed ecommerce. Invia la tua candidatura spontanea oggi stesso.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!submissionSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Office locations and expectations (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-md space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Cosa Offriamo ai Candidati</h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">L'esperienza Ink&Print By Denise</p>
                  </div>

                  <div className="space-y-6 text-xs text-slate-600 font-medium leading-relaxed">
                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase">Crescita Professionale Rapida</h4>
                        <p>Gestisci processi logistici complessi, acquisisci competenze e-commerce d'avanguardia nell'era digitale.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase">Sedi Operative Moderne</h4>
                        <p>I nostri uffici amministrativi e-commerce in centro a Naro (AG) e il polo logistico ad alta efficienza merci in Sicilia.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <Network size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase">Ambiente Inclusivo e Giovane</h4>
                        <p>Fiducia reciproca, flessibilità ed empatia. Valorizziamo l'ascolto per risolvere insieme le sfide quotidiane.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 text-[10px] text-slate-400 font-bold uppercase space-y-2">
                    <p className="flex items-center gap-2"><MapPin size={12} className="text-slate-500" /> Sede di Lavoro: Naro (AG), Sicilia</p>
                    <p className="flex items-center gap-2"><Award size={12} className="text-slate-500" /> Contratti: Tempo Determinato / Apprendistato / Indeterminato</p>
                  </div>
                </div>

                {/* Open Profiles Overview Banner */}
                <div className="bg-indigo-950 text-indigo-200 border border-indigo-900 rounded-3xl p-6 shadow space-y-3">
                  <h4 className="text-white text-xs font-black uppercase tracking-wider">I Nostri Reparti Operativi</h4>
                  <p className="text-[11px] text-indigo-400 leading-relaxed font-semibold">
                    Seleziona nel modulo la tua preferenza lavorativa. Accettiamo candidati per magazzino e sollevamento pesi, addetti all'amministrazione contabile e b2b, customer care su ticket ed e-mail, programmatori ecommerce e capi reparto spedizioni.
                  </p>
                </div>
              </div>

              {/* Right Column: Application Form (7 columns) */}
              <form 
                onSubmit={handleSubmit}
                className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl space-y-6"
              >
                <div className="border-b pb-4">
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Compila il Modulo di Candidatura</h3>
                  <p className="text-xs text-slate-400 font-medium">Allega il tuo Curriculum e presentati velocemente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-bold">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Nome *</label>
                    <input 
                      type="text"
                      required
                      placeholder="es. Francesca"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold outline-none transition-all"
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
                      placeholder="es. Colombo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold outline-none transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">E-mail *</label>
                    <input 
                      type="email"
                      required
                      placeholder="es. francesca.colombo@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Telefono */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block pl-1">Telefono Recapito *</label>
                    <input 
                      type="tel"
                      required
                      placeholder="es. +39 339 9988776"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold outline-none transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Posizione desiderata */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-500 uppercase block pl-1">Posizione Desiderata Interna *</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 text-slate-900 font-bold outline-none transition-all"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    >
                      <option value="magazzino">Operatore di Magazzino / Picking & Carico Merci</option>
                      <option value="amministrazione">Amministrazione e Contabilità Junior / Senior</option>
                      <option value="customer_service">Assistenza Clienti e Post-Vendita (Customer Care)</option>
                      <option value="ecommerce">E-commerce Developer / Web Operation Assistant</option>
                      <option value="logistica">Responsabile di Logistica & Spedizioni Nazionali</option>
                    </select>
                  </div>
                </div>

                {/* Messaggio di presentazione */}
                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-slate-500 uppercase block pl-1">Messaggio di Presentazione e Lettera di Motivazione</label>
                  <textarea 
                    rows={4}
                    placeholder="Raccontaci brevemente di te, delle tue esperienze precedenti in ambiti logistici o d'ufficio e per quale motivo desideri unirti a Ink&Print By Denise..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all leading-relaxed"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Upload CV PDF */}
                <div className="space-y-2 text-xs font-bold">
                  <label className="text-slate-500 uppercase block pl-1">Carica Curriculum Vitae (Formato PDF) *</label>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                  >
                    <input 
                      type="file" 
                      id="cv-file"
                      className="hidden" 
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="cv-file" className="cursor-pointer space-y-3 block">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center text-indigo-600">
                        <UploadCloud size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-850">Seleziona o trascina il tuo file PDF del Curriculum Vitae</p>
                        <p className="text-[10px] text-slate-400 font-medium">Richiesto formato PDF fino a un massimo di 5MB</p>
                      </div>
                    </label>

                    {uploadedCVName && (
                      <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 flex items-center justify-between text-[11px] font-bold text-indigo-850">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={14} className="text-indigo-600 shrink-0" />
                          <span className="truncate">{uploadedCVName}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setUploadedCV(null); setUploadedCVName(""); }}
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
                  disabled={isSubmitting || !uploadedCVName}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-xs uppercase py-4 rounded-xl shadow-lg hover:shadow-xl transition-all tracking-widest flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Registrazione Pratica Candidatura...</span>
                  ) : (
                    <>
                      <Send size={15} /> Invia Candidatura Spontanea
                    </>
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* --- SUBMISSION SUCCESS HERO VIEW --- */
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
                  CANDIDATURA REGISTRATA CORRETTAMENTE!
                </span>
                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">PRATICA {submissionSuccess.id} ATTIVA</h2>
                <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                  Gentile {submissionSuccess.firstName}, grazie per l'interesse dimostrato nei confronti di <strong>Ink&Print By Denise</strong>. Abbiamo caricato il tuo CV "{submissionSuccess.fileName}" nella nostra piattaforma gestione HR.
                </p>
              </div>

              {/* Email Notification Log preview */}
              <div className="bg-slate-900 rounded-3xl p-6 text-left space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-3 font-semibold text-slate-400">
                  <span className="font-mono text-indigo-400 uppercase font-black">⚡ E-MAIL DI CONFERMA INVIATA CON SUCCESSO</span>
                  <span className="font-mono">Inviato ora</span>
                </div>
                <div className="text-xs font-mono text-slate-300 leading-relaxed font-semibold space-y-1">
                  <p><span className="text-slate-500">Destinatario:</span> {submissionSuccess.email}</p>
                  <p><span className="text-slate-500">Oggetto:</span> Grazie per la tua candidatura in Ink&Print By Denise! #{submissionSuccess.id}</p>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-slate-400 text-[11px] leading-relaxed mt-2 whitespace-pre-line">
                    Gentile {submissionSuccess.firstName} {submissionSuccess.lastName},
                    ti confermiamo che l'Ufficio Risorse Umane ha ricevuto la tua candidatura spontanea per la posizione di "{submissionSuccess.position.toUpperCase()}". Il tuo profilo ed esperienze verranno presi in esame di conseguenza.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button 
                  onClick={() => { setSubmissionSuccess(null); setFirstName(""); setUploadedCVName(""); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase px-8 py-3.5 rounded-xl tracking-wider transition-all"
                >
                  Invia un'Altra Candidatura
                </button>
                <button 
                  onClick={onBack}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl tracking-wider transition-all shadow-lg shadow-indigo-100"
                >
                  Torna alla Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
