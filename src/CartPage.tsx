import React, { useState } from 'react';
import { useCart } from './CartContext.tsx';
import { 
  ShoppingCart, Trash2, ShieldCheck, Truck, RefreshCw, ArrowLeft, 
  CreditCard, Check, AlertTriangle, FileText, Info, MapPin, 
  User, Mail, Phone, ExternalLink, Printer, Clipboard, Lock, ShieldAlert
} from 'lucide-react';
import { ProductImage } from './components/ProductImage.tsx';
import { motion, AnimatePresence } from 'motion/react';

interface CartPageProps {
  onBack: () => void;
  onNavigate: (page: string, data?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onBack, onNavigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  
  // Checkout Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [province, setProvince] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Carta di Credito"); // "Carta di Credito", "PayPal", "Bonifico Bancario"
  
  // Real-time Credit Card / PayPal Gateway details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [testOutcome, setTestOutcome] = useState("success"); // "success", "insufficient_funds", "declined", "cvv"
  const [paymentError, setPaymentError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  const subtotal = cartTotal;
  const deliveryCost = subtotal > 150 ? 0 : 6.90;
  const total = subtotal + deliveryCost;

  const handleCopyIban = () => {
    navigator.clipboard.writeText("IT42 N036 6901 6005 1403 9448 155");
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setPaymentError("");

    // Validate payment inputs
    if (paymentMethod === "Carta di Credito") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (cleanCard.length < 15 || cleanCard.length > 16) {
        setPaymentError("Il numero di carta inserito non è valido (sono necessarie 15 o 16 cifre).");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setPaymentError("La data di scadenza deve essere nel formato MM/YY.");
        return;
      }
      const [expMonth, expYear] = cardExpiry.split('/').map(Number);
      if (expMonth < 1 || expMonth > 12) {
        setPaymentError("Mese di scadenza della carta non valido.");
        return;
      }
      if (cardCvv.length < 3) {
        setPaymentError("Il codice di sicurezza CVV deve essere di almeno 3 cifre.");
        return;
      }
      if (!cardName.trim()) {
        setPaymentError("Inserisci il nome del titolare della carta.");
        return;
      }
    } else if (paymentMethod === "PayPal") {
      if (!paypalEmail.includes("@") || !paypalEmail.includes(".")) {
        setPaymentError("Inserisci un indirizzo e-mail PayPal valido.");
        return;
      }
      if (paypalPassword.length < 4) {
        setPaymentError("Inserisci la password dell'account PayPal.");
        return;
      }
    }

    setIsSubmitting(true);
    
    // Simulate real authorization network delay (3D secure verification via Revolut API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const orderPayload = {
        customer: {
          name,
          email,
          phone,
          address,
          city,
          province,
          zip
        },
        items: cart.map(item => ({
          id: item.sku,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        shippingMethod: "Corriere Espresso - Consegna 24/48h",
        notes,
        total: total,
        paymentDetails: {
          outcome: testOutcome,
          cardNumber: cardNumber.replace(/\d(?=\d{4})/g, "*"), // securely mask sensitive data
          cardName,
          paypalEmail
        }
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "La transazione è stata rifiutata dal server bancario secure Revolut.");
      }
      
      const orderData = await res.json();
      setSubmittedOrder(orderData);
      clearCart(); // Wipes actual cart on success
    } catch (err: any) {
      setPaymentError(err.message || "Errore: Transazione rifiutata. Controlla il saldo o la validità della carta.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedOrder) {
    const isWire = submittedOrder.paymentMethod.toLowerCase().includes("bonifico");
    
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden p-8 md:p-14 space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check size={40} className="stroke-[3]" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">ORDINE RICEVUTO!</h1>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 py-2.5 px-6 rounded-full inline-block">
              CODICE ORDINE: {submittedOrder.orderNumber}
            </p>
            <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Grazie mille per aver acquistato su Ink&Print By Denise. Ti abbiamo inviato una e-mail di conferma contenente il riepilogo degli articoli e le credenziali di tracciamento della spedizione.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* If Wire Transfer, Display Dynamic IBAN Box */}
          {isWire && (
            <div className="bg-amber-50/60 rounded-3xl p-6 md:p-8 border border-amber-200/70 space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-1">PAGAMENTO NON ANCORA COMPLETATO</h3>
                  <p className="text-xs text-slate-500 font-medium">Stato attuale: <span className="text-amber-700 font-extrabold">In attesa di pagamento (Bonifico)</span></p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4 shadow-sm text-xs font-medium">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">COORDINATE BANCARIE PER IL BONIFICO</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Beneficiario / Intestatario</span>
                    <strong className="text-slate-900 font-black">Ink&Print By Denise S.r.l.</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Banca di Appoggio</span>
                    <strong className="text-slate-900 font-bold">Unicredit S.p.A.</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 block text-[10px] uppercase">Codice IBAN</span>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold tracking-tight">
                    <span className="text-slate-800 break-all select-all">IT42 N036 6901 6005 1403 9448 155</span>
                    <button 
                      onClick={handleCopyIban}
                      className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 uppercase text-[10px] font-black shrink-0 ml-4 border-l pl-4"
                    >
                      {copyStatus ? <Check size={12} /> : <Clipboard size={12} />}
                      {copyStatus ? 'Copiato' : 'Copia'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Causale Obbligatoria</span>
                    <strong className="text-blue-600 font-black uppercase">Pagamento Ordine {submittedOrder.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Importo Esatto da Bonificare</span>
                    <strong className="text-slate-900 font-black text-sm">€{submittedOrder.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-amber-100/10 rounded-2xl p-4 border border-dashed border-amber-300 text-[11px] text-amber-900 font-semibold leading-relaxed">
                ℹ️ <strong>Tempi di evasione:</strong> L'ordine rimarrà sospeso in archivio. Spediremo l'articolo entro 24 ore lavorative dal momento in cui riceveremo l'accredito effettivo sul conto bancario (solitamente 1-2 giorni lavorativi).
              </div>
            </div>
          )}

          {/* Recap Info Cards */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={14} className="text-blue-600" /> Destinatario</h4>
              <p className="font-extrabold text-slate-900">{submittedOrder.customer.name}</p>
              <div className="text-slate-500 space-y-1 font-semibold">
                <p>{submittedOrder.customer.address}</p>
                <p>{submittedOrder.customer.zip} {submittedOrder.customer.city} ({submittedOrder.customer.province})</p>
                <p>T: {submittedOrder.customer.phone}</p>
                <p>M: {submittedOrder.customer.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5"><Truck size={14} className="text-blue-600" /> Spedizione ed Info</h4>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2.5 font-bold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Modalità:</span>
                  <span>{submittedOrder.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Corriere:</span>
                  <span>{submittedOrder.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metodo Pagamento:</span>
                  <span>{submittedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-slate-900 font-black">Totale Pagato:</span>
                  <span className="text-slate-900 font-black font-mono">€{submittedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                // Pre-fill tracking details in state or let them trace
                onNavigate("ordini");
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center shadow-lg"
            >
              Traccia Stato Ordine
            </button>
            <button 
              onClick={() => onNavigate("bolla", submittedOrder)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center"
            >
              Vedi Bolla di Consegna
            </button>
            <button 
              onClick={() => onNavigate("catalog")}
              className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center"
            >
              Torna al Negozio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 text-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors uppercase">
            <ArrowLeft size={16} /> Torna Indietro
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Carrello e Cassa</span>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 md:p-20 border border-slate-200 text-center space-y-6 shadow-xl max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Il carrello è vuoto</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">Aggiungi cartucce, toner o altri componenti per stampanti dal catalogo per iniziare la finalizzazione dell'ordine.</p>
            <button 
              onClick={() => onNavigate("catalog")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all inline-block shadow-lg shadow-blue-100"
            >
              Esplora il Catalogo Di 1500 Prodotti
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart items */}
            <div className="lg:col-span-7 bg-white rounded-[3rem] p-6 md:p-10 border border-slate-200 shadow-xl space-y-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight border-b pb-4 flex items-center gap-3">
                 <ShoppingCart size={22} className="text-blue-600" /> Riepilogo Carrello ({cart.length} {cart.length === 1 ? 'Articolo' : 'Articoli'})
              </h2>

              <div className="divide-y divide-slate-150">
                {cart.map((item) => (
                  <div key={item.id} className="py-6 flex gap-4 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                      <ProductImage product={item} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between gap-4">
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-2 uppercase leading-snug tracking-tight">
                          {item.name}
                        </h3>
                        <span className="text-sm font-black text-slate-950 shrink-0 font-mono">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 font-bold">
                        <span className="font-mono text-[10px]">SKU: {item.sku}</span>
                        
                        <div className="flex items-center gap-4">
                          {/* Qty editor */}
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-8 bg-slate-50">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2.5 hover:bg-slate-100 font-bold text-slate-500 h-full transition-colors font-mono"
                            >
                              -
                            </button>
                            <span className="px-2 font-black text-slate-900 font-mono text-center min-w-[20px]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 hover:bg-slate-100 font-bold text-slate-500 h-full transition-colors font-mono"
                            >
                              +
                            </button>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secure note */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-start gap-3 text-xs mt-4">
                <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-0.5">SISTEMA DI CRITTOGRAFIA SSL ATTIVO</p>
                  <p className="text-slate-500 font-medium">I tuoi dati sensibili sono protetti e crittografati al 100%. Nessun dato relativo alle carte di credito viene memorizzato nei nostri server.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form & Price summary */}
            <div className="lg:col-span-5 bg-white rounded-[3rem] p-6 md:p-10 border border-slate-200 shadow-xl space-y-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight border-b pb-4">
                Spedizione e Cassa
              </h2>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-1 flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome e Cognome / Ragione Sociale *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mario Rossi"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Assistenza *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mario.rossi@email.it"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Numero Telefono *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+39 333 1234567"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Indirizzo di Spedizione Compl. *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Via Dante 12, Interno 5, Scala A"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 flex flex-col col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Città *</label>
                    <input 
                      type="text" 
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Milano"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">CAP *</label>
                    <input 
                      type="text" 
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="20121"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Provincia (Sigla) *</label>
                    <input 
                      type="text" 
                      required
                      maxLength={2}
                      value={province}
                      onChange={(e) => setProvince(e.target.value.toUpperCase())}
                      placeholder="MI"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-xs font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-center font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Note Spedizione (Opzionale)</label>
                    <input 
                      type="text" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="es. citofonare Studio"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Secure Payment System */}
                <div className="space-y-4 pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Metodo di Pagamento Garantito</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "Carta di Credito", label: "Carta Credito / Debito", img: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
                      { id: "PayPal", label: "PayPal Express", img: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
                      { id: "Bonifico Bancario", label: "Bonifico Bancario", icon: FileText }
                    ].map(m => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <div 
                           key={m.id}
                           onClick={() => {
                             setPaymentMethod(m.id);
                             setPaymentError("");
                           }}
                           className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-blue-50/70 border-blue-600 ring-4 ring-blue-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                           {m.img ? (
                             <img src={m.img} className="h-4 max-w-full opacity-80" alt={m.label} />
                           ) : Icon ? (
                             <Icon size={16} className="text-blue-600" />
                           ) : null}
                           <span className="text-[9px] font-black mt-2 text-slate-600 uppercase text-center tracking-tighter leading-none">{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC INTEGRATED GATEWAY SUB-FORM (Visa, Mastercard, Revolut secure routing) */}
                {paymentMethod === "Carta di Credito" && (
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Dettagli Carta di Credito (Revolut Gateway)</p>
                      <span className="text-[9px] font-black tracking-tighter uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Protected ssl</span>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nome Titolare Carta *</label>
                      <input 
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        placeholder="MARIO ROSSI"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:border-blue-500 outline-none text-slate-800 uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Numero Carta *</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(formatted);
                          }}
                          placeholder="4000 1234 5678 9010"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-mono font-semibold tracking-wider focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Scadenza MM/YY *</label>
                        <input 
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) {
                              val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            }
                            setCardExpiry(val.slice(0, 5));
                          }}
                          placeholder="12/28"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-semibold text-center focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 flex items-center justify-center gap-1">
                          CVV * <Lock size={10} className="text-slate-450" />
                        </label>
                        <input 
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="***"
                          maxLength={3}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-semibold text-center tracking-widest focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Simulation Console Control (As demanded by customer) */}
                    <div className="bg-blue-50/50 rounded-2xl p-3.5 border border-blue-100/70 space-y-2">
                      <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 leading-none">
                        ⚡ VERIFICA VERIDICITÀ FONDI REVOLUT
                      </p>
                      <p className="text-[8px] text-slate-500 leading-normal">
                        Per testare i messaggi di errore e i rifiuti previsti dall'ecommerce, seleziona lo stato della carta:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {[
                          { id: "success", label: "🟢 Fondi Sufficienti (Transazione Autorizzata)", desc: "Simula approvazione immediata su conto Revolut Business." },
                          { id: "insufficient_funds", label: "🔴 Fondi Insufficienti (Carta Rifiutata)", desc: "Mancanza di credito. L'ordine viene rigettato senza avvenire." },
                          { id: "declined", label: "❌ Sospetto Frode (Blocco di Sicurezza)", desc: "Blocco preventivo Revolut Secure per operazione non riconosciuta." },
                          { id: "cvv", label: "⚠️ Codice CVV Errato o Scaduto", desc: "La banca emittente nega l'autorizzazione per credenziali errate." }
                        ].map((opt) => (
                          <label key={opt.id} className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100 cursor-pointer shadow-sm hover:border-blue-200 transition-colors">
                            <input 
                              type="radio" 
                              name="sim_control" 
                              checked={testOutcome === opt.id}
                              onChange={() => setTestOutcome(opt.id)}
                              className="mt-0.5" 
                            />
                            <div className="leading-none flex flex-col">
                              <span className="text-[10px] font-black text-slate-800 tracking-tight">{opt.label}</span>
                              <span className="text-[8px] text-slate-450 mt-1">{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "PayPal" && (
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Procedura PayPal Express</p>
                      <span className="text-[9px] font-black tracking-tighter uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Protected ssl</span>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Indirizzo E-mail PayPal *</label>
                      <input 
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="mario.rossi@gmail.com"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Password Account *</label>
                      <input 
                        type="password"
                        value={paypalPassword}
                        onChange={(e) => setPaypalPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:border-blue-500 outline-none"
                      />
                    </div>

                    {/* Simulation Console Control */}
                    <div className="bg-blue-50/50 rounded-2xl p-3.5 border border-blue-100/70 space-y-2">
                       <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest leading-none">
                        ⚡ CONTROLLO SALDO PAYPAL / REVOLUT
                      </p>
                      <p className="text-[8px] text-slate-500 leading-normal">
                        Seleziona l'esito per verificare che il sistema di blocco dell'ordine funzioni correttamente:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {[
                          { id: "success", label: "🟢 Addebito Autorizzato (PayPal)", desc: "Spesa approvata dal conto Revolut collegato." },
                          { id: "insufficient_funds", label: "🔴 Saldo PayPal Non Sufficiente", desc: "La banca Revolut rifiuta il addebito per mancanza fondi." }
                        ].map((opt) => (
                          <label key={opt.id} className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100 cursor-pointer shadow-sm hover:border-blue-200 transition-colors">
                            <input 
                              type="radio" 
                              name="sim_val_paypal" 
                              checked={testOutcome === opt.id}
                              onChange={() => setTestOutcome(opt.id)}
                              className="mt-0.5" 
                            />
                            <div className="leading-none flex flex-col">
                              <span className="text-[10px] font-black text-slate-800 tracking-tight">{opt.label}</span>
                              <span className="text-[8px] text-slate-450 mt-1">{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Secure Trust Badges Area */}
                <div className="bg-emerald-50/55 rounded-2xl p-4 border border-emerald-100 space-y-3">
                  <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <ShieldCheck size={14} className="text-emerald-600" /> Transazione Protetta SSL 100%
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[9px] font-bold text-slate-600 leading-tight">
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600">🔐</span>
                      <span><strong>SSL Cifrato 256-bit:</strong> Protezione dati sensibili totale con certificato HTTPS RSA.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600">🛡️</span>
                      <span><strong>3D Secure:</strong> Autenticazione a due fattori attiva per carte Visa e Mastercard.</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-blue-900 col-span-2 border-t border-emerald-100/60 pt-2 mt-1">
                      <span>🕵🏼‍♂️ <strong>Conformità GDPR:</strong> I tuoi dati di spedizione sono protetti secondo la normativa europea UE 2016/679.</span>
                    </div>
                  </div>
                </div>

                {/* If wire transfer chosen, show preview instructions */}
                {paymentMethod === "Bonifico Bancario" && (
                  <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 text-[10px] text-blue-900 leading-normal font-medium space-y-1.5 animate-fadeIn">
                     <p className="font-extrabold uppercase tracking-widest text-[9px] text-blue-800">ℹ️ BONIFICO BANCARIO (ATTESA CONFERMA)</p>
                     <p>Mostreremo le coordinate bancarie e l'IBAN stampabile immediatamente dopo l'invio dell'ordine.</p>
                     <p className="font-extrabold text-slate-900">Beneficiario: <span className="font-medium text-slate-700">Ink&Print By Denise S.r.l.</span></p>
                     <p className="font-extrabold text-slate-900">IBAN: <span className="font-mono text-blue-700">IT42 N036 6901 6005 1403 9448 155</span></p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-1">⚠️ L'ordine rimarrà "In attesa di pagamento" finché i nostri operatori di Naro (AG) non avranno validato la ricezione dei fondi.</p>
                  </div>
                )}

                {/* Payment error notification */}
                {paymentError && (
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex gap-3 text-xs text-rose-800 font-medium leading-relaxed animate-fadeIn">
                    <ShieldAlert size={20} className="shrink-0 text-rose-600 self-start mt-0.5" />
                    <div>
                      <p className="font-extrabold uppercase tracking-widest text-[9px] text-rose-900 mb-1">PAGAMENTO NEGATO / AUTORIZZAZIONE FALLITA 🏦</p>
                      <p className="font-black text-slate-900 text-[11px] mb-1">{paymentError}</p>
                      <p className="text-[9px] text-rose-600 font-bold uppercase leading-tight mt-1.5">
                        ⚠️ Errore di transazione Revolut. L'ordine NON è stato completato e non compare nel sistema. Riprova con un saldo sufficiente, cambia carta o scegli "Bonifico Bancario".
                      </p>
                    </div>
                  </div>
                )}

                {/* Totals Recaps */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>Subtotale Carrello:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>Spedizione BRT/GLS:</span>
                    <span>{deliveryCost === 0 ? <span className="text-green-600 font-bold uppercase text-[10px]">Gratis</span> : `€${deliveryCost.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2.5 flex justify-between text-slate-900 font-black text-sm uppercase">
                    <span>Totale (Iva incl.):</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  {isSubmitting ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-3 animate-pulse">
                      <div className="flex justify-center">
                        <RefreshCw size={24} className="text-blue-600 animate-spin" />
                      </div>
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest leading-none">🔐 AUTENTICAZIONE BANCO REVOLUT SICURA...</p>
                      <div className="text-[9px] text-slate-600 font-bold max-w-xs mx-auto space-y-0.5 leading-normal">
                        <p className="flex items-center justify-center gap-1.5">● Connessione protetta SSL attiva...</p>
                        <p className="flex items-center justify-center gap-1.5">● Analisi antifrode 3D Secure...</p>
                        <p className="flex items-center justify-center gap-1.5">● Verifica saldo e autorizzazione plafond...</p>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="submit"
                      className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
                    >
                      Conferma e Ordina • €{total.toFixed(2)}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
