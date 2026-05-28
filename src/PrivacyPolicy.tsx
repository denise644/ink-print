import React from 'react';
import { Shield, ArrowLeft, Lock, Database, UserCheck, ShoppingBag, Mail, Cookie, CreditCard, PenTool } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const sections = [
    {
      id: "raccolta-dati",
      title: "1. Raccolta dei Dati Personali",
      icon: Database,
      content: "Raccogliamo diverse tipologie di informazioni per fornirti ed ottimizzare i nostri servizi e-commerce. Questi includono: dati identificativi e dettagli di contatto (nome, cognome, codice fiscale o Partita IVA, e-mail, telefono), dati di fatturazione e spedizione, credenziali di accesso, e indirizzi IP con metadati di navigazione registrati dai sistemi tecnici di sicurezza."
    },
    {
      id: "gestione-account",
      title: "2. Gestione dell'Account",
      icon: UserCheck,
      content: "I dati salvati nel profilo utente vengono trattati nell'ambito dell'esecuzione del rapporto contrattuale per consentire la creazione della scheda anagrafica, l'accesso alle aree protette, la consultazione dello storico acquisti e lo scaricamento autonomo dei documenti fiscali quali fatture o note di consegna (DDT)."
    },
    {
      id: "ordini",
      title: "3. Elaborazione e Gestione Ordini",
      icon: ShoppingBag,
      content: "La raccolta di indirizzi e recapiti per le consegne è un prerequisito commerciale obbligatorio. Condividiamo questi dati esclusivamente con i nostri vettori di logistica convenzionati per completare la spedizione fisica dei toner e delle cartucce ordinate. La mancata fornitura comporta l'impossibilità di elaborare l'ordine."
    },
    {
      id: "newsletter",
      title: "4. Newsletter e Marketing",
      icon: Mail,
      content: "Previa espressione di un tuo consenso esplicito e revocabile in qualsiasi momento, utilizzeremo il tuo indirizzo e-mail per notificarti sconti esclusivi, disponibilità di lotti e aggiornamenti sul catalogo dei consumabili per stampa. Non vendiamo né cediamo mai mailing list a soggetti esterni."
    },
    {
      id: "cookies",
      title: "5. Uso dei Cookie",
      icon: Cookie,
      content: "Utilizziamo cookie tecnici per memorizzare lo stato del tuo carrello durante la sessione e cookie analitici anonimizzati al fine di studiare le prestazioni del portatole. Puoi limitare le preferenze di tracciamento consultando la nostra Cookie Policy e agendo sulle impostazioni del tuo browser o sul pannello integrato."
    },
    {
      id: "pagamenti",
      title: "6. Gestione dei Pagamenti",
      icon: CreditCard,
      content: "Tutti i flussi finanziari relativi ad acquisti con carta di credito, PayPal e Stripe avvengono su protocolli di cifratura sicura HTTPS gestiti direttamente dagli istituti di credito. Ink&Print By Denise non acquisisce, non registra e non conserva nei propri server i dati di pagamento o i codici delle tue carte di credito."
    },
    {
      id: "sicurezza-dati",
      title: "7. Sicurezza del Trattamento",
      icon: Lock,
      content: "Adottiamo moderne misure di sicurezza tecnologiche ed organizzative ai sensi dell'Art. 32 GDPR (tra cui crittografia SSL/TLS a 256-bit, firewall e backup sistematici) per proteggere i tuoi dati personali da accessi non autorizzati, divulgazioni illecite o distruzioni accidentali delle banche dati."
    },
    {
      id: "contatti-privacy",
      title: "8. Contatti Privacy & Diritti",
      icon: Shield,
      content: "In conformità agli articoli 15-22 del GDPR, in ogni momento puoi esercitare il diritto di accesso ai tuoi dati, chiederne la rettificazione, la portabilità, la limitazione del trattamento o la cancellazione definitiva. Per qualsiasi richiesta, puoi scrivere direttamente al Responsabile del Trattamento all'e-mail: inkprint26@gmail.com."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm uppercase tracking-wider mb-8 transition-colors"
          id="btn-privacy-back"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Indietro alla Home
        </button>

        {/* Header Hero */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="bg-blue-150 inline-flex p-3 rounded-2xl text-blue-600">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Informativa sulla Privacy</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              La tutela dei tuoi dati personali è fondamentale per noi. Questa informativa spiega come raccogliamo, conserviamo e trattiamo le informazioni in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679) per l'e-commerce Ink&Print By Denise.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono font-bold uppercase">
              Ultimo aggiornamento: 22 Maggio 2026
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full translate-x-16 -translate-y-16 blur-xl" />
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          {sections.map((sec, i) => {
            const IconComponent = sec.icon;
            return (
              <motion.div 
                key={sec.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                id={`sec-${sec.id}`}
                className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-blue-600 shrink-0 mt-1">
                    <IconComponent size={20} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{sec.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {sec.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Summary Notice */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center text-xs">
          <p className="font-bold text-slate-700 max-w-xl mx-auto leading-relaxed">
            Continuando ad utilizzare il nostro portale e compilando la navigazione nel catalogo o l'inserimento dei prodotti nel carrello, acconsenti al trattamento descritto in questa pagina.
          </p>
        </div>
      </div>
    </div>
  );
};
