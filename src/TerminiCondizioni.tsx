import React from 'react';
import { FileText, ArrowLeft, Truck, RefreshCw, ShieldCheck, Scale, CreditCard, ShoppingBag, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface TerminiCondizioniProps {
  onBack: () => void;
}

export const TerminiCondizioni: React.FC<TerminiCondizioniProps> = ({ onBack }) => {
  const policies = [
    {
      title: "1. Condizioni Generali di Vendita",
      icon: Scale,
      content: "I contratti di vendita stipulati sul portale Ink&Print By Denise sono regolati dal Codice del Consumo italiano (D.Lgs. 206/2005) e dalle norme sul commercio elettronico (D.Lgs. 70/2003). L'acquisto dei toner, tambour, e cartucce disponibili sul catalogo è consentito sia a consumatori privati (B2C) sia a professionisti e imprese titolari di partita IVA (B2B)."
    },
    {
      title: "2. Gestione degli Ordini e Accettazione",
      icon: ShoppingBag,
      content: "La ricezione di un ordine online genera l'invio automatico di un'e-mail di riepilogo contrattuale. Ogni transazione si intende accettata ed efficace solo dopo la verifica di magazzino e la conseguente emissione della conferma d'ordine o della nota di consegna (DDT). Ink&Print By Denise si riserva la facoltà di rifiutare ordini in caso di anomalie di prezzo o indisponibilità improvvisa di lotti di consumabili."
    },
    {
      title: "3. Spedizioni, Tempi e Tariffe",
      icon: Truck,
      content: "Spediamo in tutta Italia tramite corrieri espresso GLS, DHL e BRT con consegna in 24/48 ore lavorative (72 ore per isole e zone franche). Le tariffe di spedizione sono chiaramente indicate in fase di check-out del carrello e sono gratuite per ordini superiori alla soglia promozionale indicata. All'avvenuta presa in carico della spedizione, il cliente riceve via email il relativo numero di tracking."
    },
    {
      title: "4. Diritto di Recesso e Politica dei Resi",
      icon: RefreshCw,
      content: "Ai sensi dell'Art. 52 del Codice del Consumo, il cliente B2C ha il diritto di recedere dal contratto di acquisto entro 14 giorni solari dalla consegna fisica della merce. La gestione dei resi e dei rimborsi è centralizzata tramite il nostro portale gestionale esterno. Per avviare una procedura di reso, ti invitiamo a contattare il nostro supporto clienti tramite la sezione 'Contatti' per ricevere le istruzioni e il link al portale dedicato."
    },
    {
      title: "5. Criteri e Tempistiche dei Rimborsi",
      icon: ShieldCheck,
      content: "Una volta ricevuto e ispezionato l'articolo restituito nei nostri magazzini logistici, provvederemo ad emettere il rimborso entro un termine massimo di 7 giorni lavorativi. Il rimborso viene eseguito utilizzando lo stesso strumento di pagamento adoperato dal cliente per la transazione iniziale (Carta di Credito, Stripe o PayPal)."
    },
    {
      title: "6. Sistemi di Pagamento Accettati",
      icon: CreditCard,
      content: "Sono accettati pagamenti tramite carte di credito e di debito dei principali circuiti internazionali (Visa, Mastercard, Maestro), account PayPal autorizzati, Stripe Secure Payment, e bonifico bancario anticipato (l'ordine in questo caso verrà evaso solo all'accredito effettivo dei fondi sul nostro conto corrente)."
    },
    {
      title: "7. Responsabilità ed Esenzioni",
      icon: Terminal,
      content: "Ink&Print By Denise garantisce l'eccellente qualità e la compatibilità al 100% di tutti i suoi toner e consumabili compatibili. Non assumiamo alcuna responsabilità per disservizi imputabili a cause di forza maggiore, scioperi generali dei vettori, o eventi eccezionali che impediscano la consegna nei tempi prestabiliti. Non siamo responsabili per danni derivanti da installazione errata o incuria nell'uso dei prodotti sulle stampanti."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm uppercase tracking-wider mb-8 transition-colors"
          id="btn-terms-back"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Indietro alla Home
        </button>

        {/* Header Hero Title */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="bg-blue-100 inline-flex p-3 rounded-2xl text-blue-600">
              <FileText size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Termini e Condizioni di Vendita</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Il presente documento stabilisce le norme contrattuali che regolano l'acquisto dei prodotti sul portale e-commerce Ink&Print By Denise. Ti invitiamo a leggere attentamente questi termini prima di completare qualsiasi acquisto.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono font-bold uppercase">
              Doc. ID: TC_INK_PRINT_2026
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full translate-x-16 -translate-y-16 blur-xl" />
        </div>

        {/* Terms Articles Block */}
        <div className="space-y-8">
          {policies.map((policy, i) => {
            const IconComponent = policy.icon;
            return (
              <motion.div 
                key={policy.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-blue-600 shrink-0 mt-1">
                    <IconComponent size={20} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">{policy.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {policy.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-12 bg-slate-900 text-slate-400 border border-slate-800 rounded-3xl p-8 text-center text-xs space-y-2">
          <p className="font-bold text-white uppercase tracking-wider font-mono">Foro Competente Residente</p>
          <p className="max-w-xl mx-auto leading-relaxed">
            Per qualsiasi controversia derivante dall'interpretazione o dall'esecuzione dei presenti Termini e Condizioni, qualora il cliente sia un consumatore privato residente in Italia, il foro competente sarà per legge il tribunale di residenza del consumatore. Per clienti ed imprese estere o B2B, il foro competente esclusivo sarà il tribunale di Agrigento.
          </p>
        </div>
      </div>
    </div>
  );
};
