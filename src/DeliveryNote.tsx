import React, { useRef } from 'react';
import { FileDown, Printer, ArrowLeft, Truck, Package, MapPin, Search, Mail, Smartphone, Globe, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DeliveryNoteProps {
  order: {
    orderNumber: string;
    date: string;
    customer: {
      name: string;
      address: string;
      city: string;
      province: string;
      zip: string;
      phone: string;
      email: string;
    };
    paymentMethod: string;
    shippingMethod: string;
    carrier: string;
    trackingCode: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  onBack?: () => void;
}

export const DeliveryNote = ({ order, onBack }: DeliveryNoteProps) => {
  const downloadPDF = async () => {
    const element = document.getElementById('printable-bolla');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Bolla_Spedizione_${order.orderNumber}.pdf`);
  };

  const printDoc = () => window.print();

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 6.90;
  const iva = (subtotal + shipping) * 0.22;
  const total = subtotal + shipping + iva;

  return (
    <div className="min-h-screen bg-slate-100/50 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center no-print">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Torna ai Dettagli Ordine
          </button>
        )}
        <div className="flex gap-4 ml-auto">
          <button 
            onClick={printDoc}
            className="flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-200 px-5 py-2.5 rounded-xl font-black hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} /> STAMPA BOLLA
          </button>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <FileDown size={18} /> SCARICA PDF
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white mx-auto shadow-2xl overflow-hidden print:shadow-none print:border-0"
        id="printable-bolla"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Header - Ink&Print By Denise Branding */}
        <div className="p-10 border-b-4 border-blue-600 flex justify-between items-start bg-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-slate-200">
                <img 
                  src="/src/assets/images/inkprint_new_logo_1779957051282.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-3xl font-black tracking-tighter text-slate-900 uppercase">INK&PRINT<span className="text-blue-600"> BY</span> DENISE</div>
            </div>
            <div className="text-[10px] text-slate-500 font-bold leading-tight space-y-1">
              <p className="text-xs text-slate-900 font-black">Ink&Print By Denise</p>
              <p>Via Sabella 11</p>
              <p>92028 Naro (AG) - Sicilia, Italia</p>
              <p>P.IVA / C.F.: IT01234567890</p>
              <p>Email: info@inkprint.it | Tel: +39 349 8127391</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xl mb-2">BOLLA DI SPEDIZIONE</div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Documento di Trasporto (DDT)</p>
              <p className="text-lg font-black text-slate-900">N. {order.orderNumber}</p>
              <p className="text-sm font-bold text-slate-500">Data: {order.date}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-12 space-y-12">
          {/* Customer & Order Grid */}
          <div className="grid grid-cols-2 gap-12">
            {/* Destinatario */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative">
              <div className="absolute top-4 right-4 text-blue-600/20">
                <MapPin size={40} />
              </div>
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 border-b border-blue-100 pb-2">Destinatario Spedizione</h3>
              <div className="space-y-2">
                <p className="text-xl font-black text-slate-900">{order.customer.name}</p>
                <div className="text-sm text-slate-600 font-bold space-y-1">
                  <p>{order.customer.address}</p>
                  <p>{order.customer.zip} {order.customer.city} ({order.customer.province})</p>
                  <p className="pt-2 flex items-center gap-2"><Smartphone size={14} className="text-slate-400" /> {order.customer.phone}</p>
                  <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {order.customer.email}</p>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Dettagli Logistici</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Metodo Pagamento</label>
                  <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Metodo Spedizione</label>
                  <p className="text-sm font-bold text-slate-900">{order.shippingMethod}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Corriere</label>
                  <p className="text-sm font-black text-blue-600 uppercase">{order.carrier}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Tracking Number</label>
                  <p className="text-sm font-mono font-black text-slate-900">{order.trackingCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Package size={16} className="text-blue-600" /> Elenco Articoli Spediti
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                  <th className="p-4 text-left rounded-l-xl">Codice / SKU</th>
                  <th className="p-4 text-left">Descrizione Articolo</th>
                  <th className="p-4 text-center">Qtà</th>
                  <th className="p-4 text-right">Unitario</th>
                  <th className="p-4 text-right rounded-r-xl">Totale</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="p-4 font-black text-slate-900">{item.name}</td>
                    <td className="p-4 text-center font-bold">{item.quantity}</td>
                    <td className="p-4 text-right font-bold text-slate-600">{item.price.toFixed(2)} €</td>
                    <td className="p-4 text-right font-black text-slate-900">{(item.price * item.quantity).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Subtotale:</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Spedizione:</span>
                <span>{shipping.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                <span>IVA (22%):</span>
                <span>{iva.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-3">
                <span>TOTALE:</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notes & Greetings */}
          <div className="grid grid-cols-2 gap-12 pt-12">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b pb-2">Informazioni Importanti</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
                Ti ringraziamo per aver scelto <strong>Ink&Print By Denise</strong>. Verificare l'integrità del collo al momento della consegna. Eventuali anomalie devono essere segnalate al corriere mettendo riserva di controllo specifica. In caso di reso, utilizzare l'apposito modulo reperibile sul nostro sito nella sezione assistenta.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-blue-600 rounded-3xl text-white text-center">
              <CheckSquare size={32} className="mb-2 opacity-50" />
              <p className="font-black text-xl leading-tight">GRAZIE PER<br />IL TUO ORDINE!</p>
              <p className="text-[10px] font-bold opacity-70 mt-2">Team Ink&Print By Denise Professional</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 text-white p-10 mt-auto">
          <div className="grid grid-cols-4 gap-8 text-[9px] uppercase font-black tracking-widest text-center">
            <div className="flex flex-col items-center gap-2">
              <Globe size={16} className="text-blue-500" />
              <span>www.inkprint.it</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              <span>support@inkprint.it</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Smartphone size={16} className="text-blue-500"  />
              <span>+39 0123 456789</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-green-400">
               <svg size={16} viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.706 2.006-1.388.248-.682.248-1.265.174-1.388-.074-.124-.272-.198-.57-.347m-4.821 7.454c-1.893 0-3.748-.511-5.36-1.478L3 21l.643-4.14A10.606 10.606 0 0 1 2.1 11.5c0-5.854 4.757-10.61 10.61-10.61a10.61 10.61 0 0 1 10.61 10.61c0 5.854-4.757 10.61-10.61 10.61m0-22.31C6.012-1.256 0 4.456 0 11.458c0 2.24.583 4.425 1.69 6.357L0 24l6.326-1.66c1.921 1.026 4.08 1.572 6.275 1.572 6.6 0 12.61-5.712 12.61-12.454a12.61 12.61 0 0 0-12.61-12.716"/></svg>
               <span>WhatsApp Assistenza</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .min-h-screen { padding-top: 0 !important; }
        }
      `}</style>
    </div>
  );
};

function CheckSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
