import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, ShieldCheck, Truck, RotateCcw, AlertTriangle, Star, Check, 
  Printer, ArrowLeft, Heart, Share2, Info, ChevronRight, HelpCircle, 
  ThumbsUp, MessageSquare, Award, Clock, Sparkles, CreditCard, Lock, ShieldAlert, RefreshCw
} from 'lucide-react';
import { Product } from './types.ts';
import { useCart } from './CartContext.tsx';
import { ProductImage, getProductImageGallery } from './components/ProductImage.tsx';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onNavigate: (page: string, category?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onNavigate }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [magnifier, setMagnifier] = useState({
    show: false,
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0
  });
  const [activeTab, setActiveTab] = useState<'info' | 'compatibility' | 'specifications'>('info');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Checkout Form State
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutPayment, setCheckoutPayment] = useState("stripe"); // stripe or paypal or contrassegno

  // Card & PayPal validation details for fast checkout
  const [fastCardNumber, setFastCardNumber] = useState("");
  const [fastCardName, setFastCardName] = useState("");
  const [fastCardExpiry, setFastCardExpiry] = useState("");
  const [fastCardCvv, setFastCardCvv] = useState("");
  const [fastPaypalEmail, setFastPaypalEmail] = useState("");
  const [fastPaypalPassword, setFastPaypalPassword] = useState("");
  const [fastTestOutcome, setFastTestOutcome] = useState("success"); // success, insufficient_funds, declined, cvv
  const [fastPaymentError, setFastPaymentError] = useState("");
  const [fastIsSubmitting, setFastIsSubmitting] = useState(false);

  // Unified template images for high consistency across all products by category
  const secondaryImages = getProductImageGallery(product);

  // Specific high-fidelity metadata based on product
  const getColore = () => {
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('iano') || nameLower.includes(' - c')) return 'Ciano (Cyan)';
    if (nameLower.includes('agenta') || nameLower.includes(' - m')) return 'Magenta';
    if (nameLower.includes('iallo') || nameLower.includes(' - y')) return 'Giallo (Yellow)';
    if (nameLower.includes('nero') || nameLower.includes('bk') || nameLower.includes('black')) return 'Nero (Black)';
    return 'Multicolore (BK / C / M / Y)';
  };

  const getResaPagine = () => {
    const isToner = product.category.toLowerCase().includes('toner');
    if (isToner) {
      if (product.name.toLowerCase().includes('xl') || product.name.toLowerCase().includes('high')) {
        return '~6.000 Copy (Copertura 5%)';
      }
      return '~2.500 Copy (Copertura 5%)';
    } else {
      if (product.name.toLowerCase().includes('xl')) {
        return '~1.200 Foto/Pagine';
      }
      return '~450 Foto/Pagine';
    }
  };

  const originalPrice = product.price * 1.15; // Simulate 15% discount
  const isToner = product.category.toLowerCase().includes('toner');
  const isInkjet = product.category.toLowerCase().includes('cartucc') || product.category.toLowerCase().includes('inkjet') || product.category.toLowerCase().includes('inchiost') || product.category.toLowerCase().includes('ink');

  // Fetch related products of same brand / category
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(product.category)}`);
        const data = await res.json();
        // filter out current product & take first 4
        const filtered = data.filter((p: Product) => p.id !== product.id).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [product]);

  // Handle magnifying glass mouse positioning and background offsets
  const handleMagnifierMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Percentages for background-position
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    
    setMagnifier({
      show: true,
      x,
      y,
      bgX,
      bgY
    });
  };

  const handleMagnifierMouseLeave = () => {
    setMagnifier({
      show: false,
      x: 0,
      y: 0,
      bgX: 0,
      bgY: 0
    });
  };

  const handleAddToCartClick = () => {
    for (let i = 0; i < selectedQty; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNowClick = () => {
    setShowCheckoutModal(true);
  };

  const submitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutEmail || !checkoutAddress) return;
    setFastPaymentError("");

    // Validate inputs based on payment choice
    if (checkoutPayment === "stripe") {
      const cleanCard = fastCardNumber.replace(/\s+/g, "");
      if (cleanCard.length < 15 || cleanCard.length > 16) {
        setFastPaymentError("Il numero di carta inserito non è valido (sono necessarie 15 o 16 cifre).");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(fastCardExpiry)) {
        setFastPaymentError("La data di scadenza deve essere nel formato MM/YY.");
        return;
      }
      const [expMonth, expYear] = fastCardExpiry.split('/').map(Number);
      if (expMonth < 1 || expMonth > 12) {
        setFastPaymentError("Mese di scadenza della carta non valido.");
        return;
      }
      if (fastCardCvv.length < 3) {
        setFastPaymentError("Il codice di sicurezza CVV deve essere di almeno 3 cifre.");
        return;
      }
      if (!fastCardName.trim()) {
        setFastPaymentError("Inserisci il nome del titolare della carta.");
        return;
      }
    } else if (checkoutPayment === "paypal") {
      if (!fastPaypalEmail.includes("@") || !fastPaypalEmail.includes(".")) {
        setFastPaymentError("Inserisci un indirizzo e-mail PayPal valido.");
        return;
      }
      if (fastPaypalPassword.length < 4) {
        setFastPaymentError("Inserisci la password dell'account PayPal.");
        return;
      }
    }

    setFastIsSubmitting(true);

    // Simulate real delay for card funds authorization
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const payMethod = checkoutPayment === 'bonifico' ? 'Bonifico Bancario' : checkoutPayment === 'paypal' ? 'PayPal' : 'Carta di Credito';
      const orderPayload = {
        customer: {
          name: checkoutName,
          email: checkoutEmail,
          phone: checkoutPhone || "+39 12345678",
          address: checkoutAddress,
          city: checkoutCity || "Roma",
          province: "RM",
          zip: "00100"
        },
        items: [
          {
            id: product.sku,
            name: product.name,
            quantity: selectedQty,
            price: product.price
          }
        ],
        paymentMethod: payMethod,
        shippingMethod: "Corriere Espresso - Consegna 24/48h",
        total: product.price * selectedQty,
        paymentDetails: {
          outcome: fastTestOutcome,
          cardNumber: fastCardNumber.replace(/\d(?=\d{4})/g, "*"), // securely mask sensitive details
          cardName: fastCardName,
          paypalEmail: fastPaypalEmail
        }
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "La transazione è stata rifiutata dal server sicuro.");
      }

      setOrderComplete(true);
      setTimeout(() => {
        setShowCheckoutModal(false);
        setOrderComplete(false);
        setCheckoutName("");
        setCheckoutEmail("");
        setCheckoutAddress("");
        onBack();
      }, 3000);
    } catch (err: any) {
      setFastPaymentError(err.message || "La transazione è stata negata dal gateway bancario secure Revolut.");
      console.error(err);
    } finally {
      setFastIsSubmitting(false);
    }
  };

  // Mock Reviews
  const reviews = [
    { name: "Gianluca M.", rating: 5, date: "15 Maggio 2026", comment: "Super compatibilità! Inserito sulla mia stampante Brother e riconosciuto all'istante senza problemi di chip. Stampe perfette ed eccezionale brillantezza del nero.", verified: true },
    { name: "Alessia T.", rating: 5, date: "02 Aprile 2026", comment: "Spedizione velocissima, arrivato in meno di 24 ore a Firenze. Qualità del toner indistinguibile dall'originale ad una frazione del costo. Altamente consigliato!", verified: true },
    { name: "Robert H. (Ufficio)", rating: 4, date: "19 Marzo 2026", comment: "Ottimo rapporto qualità/prezzo per le forniture della nostra associazione. Consumo regolare e ottima resa in termini di pagine stampate. Compreremo sicuramente di nuovo.", verified: true }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 text-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors uppercase shrink-0">
            <ArrowLeft size={16} /> Torna al Catalogo
          </button>
          <span className="text-slate-300">/</span>
          <span className="cursor-pointer hover:text-blue-600 transition-colors shrink-0" onClick={() => onNavigate('catalog', product.category)}>{product.category}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 line-clamp-1 flex-1 max-w-[250px]">{product.name}</span>
        </div>

        {/* Product Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[3rem] p-6 lg:p-12 border border-slate-200 shadow-xl overflow-hidden mb-16">
          {/* Left Column: Interactive Image Gallery */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            {/* Main Showcase Image */}
            <div 
              id={`ai-product-img-container-${product.id}`}
              className="relative aspect-square rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden cursor-crosshair h-[350px] md:h-full select-none shadow-inner"
              onMouseMove={handleMagnifierMouseMove}
              onMouseLeave={handleMagnifierMouseLeave}
            >
              <ProductImage 
                product={product} 
                viewIndex={selectedImageIdx} 
                className="max-h-full max-w-full object-contain" 
              />

              {magnifier.show && !isInkjet && (
                <div 
                  className="absolute pointer-events-none rounded-full border-4 border-white bg-slate-50 shadow-2xl z-35"
                  style={{
                    width: '180px',
                    height: '180px',
                    left: `${magnifier.x - 90}px`,
                    top: `${magnifier.y - 90}px`,
                    backgroundImage: `url(${secondaryImages[selectedImageIdx]})`,
                    backgroundPosition: `${magnifier.bgX}% ${magnifier.bgY}%`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '280%', // 2.8x Zoom for supreme clarity of packaging texture
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15), inset 0 0 15px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.3)',
                    mixBlendMode: 'normal'
                  }}
                >
                  {/* Real glassy light reflection overlay inside the lens */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/30 border border-white/5 pointer-events-none" />
                  {/* Subtle target alignment layout to enhance technical/high-fidelity feeling */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-blue-500/10 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-blue-500/10 pointer-events-none" />
                </div>
              )}

              {/* Quality Label Badge */}
              <div className="absolute bottom-6 left-6 bg-slate-900/95 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm z-20 shadow-sm">
                <Sparkles size={11} className="text-yellow-400" /> Qualità Oro 100%
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="grid grid-cols-3 gap-4">
              {secondaryImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative aspect-square rounded-2xl bg-slate-50 border-2 overflow-hidden flex items-center justify-center transition-all hover:border-blue-600 ${selectedImageIdx === idx ? 'border-blue-600 ring-4 ring-blue-100 shadow' : 'border-slate-100'}`}
                >
                  <div className="w-full h-full p-1.5 flex items-center justify-center bg-white overflow-hidden">
                    <ProductImage 
                      product={product} 
                      viewIndex={idx} 
                      className="max-h-full max-w-full object-contain" 
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Key Details, Price, Actions */}
          <div className="lg:col-span-6 flex flex-col h-full justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-blue-100 text-blue-800 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                  {product.brand} {isToner ? 'Toner' : 'Cartuccia'}
                </span>
                
                {product.availability ? (
                  <span className="bg-green-100 text-green-800 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Disponibilità Immediata
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    Su Ordinazione
                  </span>
                )}
                
                <span className="text-xs text-slate-400 font-bold ml-auto font-mono">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                {product.name}
              </h1>

              {/* Verified Product Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                </div>
                <span className="text-xs font-bold text-slate-500 mt-0.5">5.0 (3 Recensioni Verificate)</span>
              </div>

              {/* Short professional copy */}
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Consumabile professionale per stampanti con chip intelligente aggiornato a Maggio 2026. Altissima resa cromatica, perfetto trasferimento d'inchiostro per risultati impeccabili sia a livello aziendale che privato.
              </p>

              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Colore</p>
                  <p className="text-xs font-black text-slate-800">{getColore()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Resa Pagine</p>
                  <p className="text-xs font-black text-slate-800">{getResaPagine()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center col-span-2 md:col-span-1">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Garanzia</p>
                  <p className="text-xs font-black text-green-600">36 Mesi Totale</p>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 line-through">Listino: €{originalPrice.toFixed(2)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">€{product.price.toFixed(2)}</span>
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Risparmi il 15%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Iva inclusa • Consegna tracciabile</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-slate-900 flex items-center justify-end gap-1 text-green-600">
                    <Truck size={14} /> Spedizione 24h
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Spesa gratuita sopra €150</span>
                </div>
              </div>
            </div>

            {/* Purchase Options Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity input */}
                <div className="flex flex-col">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Qta</label>
                  <div className="flex items-center border-2 border-slate-100 bg-white rounded-xl overflow-hidden h-14">
                    <button 
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      className="px-4 hover:bg-slate-50 font-bold text-slate-500 h-full transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 font-black text-slate-900 text-sm">{selectedQty}</span>
                    <button 
                      onClick={() => setSelectedQty(selectedQty + 1)}
                      className="px-4 hover:bg-slate-50 font-bold text-slate-500 h-full transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Primary Buy Action Buttons */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 invisible">Actions</label>
                  <div className="grid grid-cols-2 gap-3 h-14">
                    <button 
                      onClick={handleAddToCartClick}
                      disabled={!product.availability}
                      className={`rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${added ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                      {added ? 'Aggiunto' : 'Aggiungi'}
                    </button>
                    <button 
                      onClick={handleBuyNowClick}
                      disabled={!product.availability}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl shadow-blue-600/20"
                    >
                      Acquista Ora
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick trust assurances */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="text-blue-600" size={20} />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Pagamento Sicuro</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="text-blue-600" size={20} />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Reso Facile 30gg</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Printer className="text-blue-600" size={20} />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Test Compatibilità</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Detail Tabs & Specifications Section */}
        <div className="bg-white rounded-[3rem] p-6 lg:p-12 border border-slate-200 shadow-md mb-16">
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-8">
            {[
              { id: 'info', label: 'Descrizione Prodotto' },
              { id: 'compatibility', label: 'Lista Stampanti Compatibili' },
              { id: 'specifications', label: 'Specifiche Tecniche' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-slate-600">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Qualità e Performance Garantite</h3>
                <p className="leading-relaxed text-sm font-medium">
                  {product.description} Progettato specificamente per integrarsi in maniera stabile coi sistemi della tua stampante. Il nostro chip intelligente gestisce in tempo reale il livello d'inchiostro residuo comunicandolo tempestivamente al driver di sistema, per evitare guasti, sbiadimenti o righe antiestetiche sui tuoi documenti aziendali o personali.
                </p>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase">Certificazione ISO 9001/14001</h4>
                      <p className="text-xs text-slate-500 font-medium">Standard produttivi rigorosi per assicurare precisione e zero residui dannosi nei rulli.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase">Massima resa a lungo termine</h4>
                      <p className="text-xs text-slate-500 font-medium">Sigillati ermeticamente contro l'umidità e la secchezza, stoccabili fino a 24 mesi.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Printer size={24} className="text-blue-600" />
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Elenco Macchine Compatibili</h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verifica se il modello esatto della tua stampante è incluso nell'elenco ufficiale di compatibilità:</p>
                
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {product.compatibility.map((model, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-4 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                      <span className="font-bold text-slate-700 text-xs font-mono tracking-tight">{model}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
                  <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">Hai dubbi sulla dicitura esatta?</h4>
                    <p className="text-xs text-blue-800 font-medium">Se il tuo modello non è presente, o se la dicitura cambia per poche lettere finali, contatta la nostra assistenza professionale via WhatsApp. Un operatore verificherà la corrispondenza in pochi istanti.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-xl space-y-4 font-medium text-sm">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Caratteristiche Costruttive</h3>
                {[
                  { name: "Marca Consumabile", val: "Ink&Print By Denise Professional Gold Line" },
                  { name: "Brand Stampante Associato", val: product.brand },
                  { name: "Codice Standard SKU", val: product.sku },
                  { name: "Colore Principale", val: getColore() },
                  { name: "Resa Pagine Standard", val: getResaPagine() },
                  { name: "Tipo di Inchiostro/Polvere", val: isToner ? "Polvere Polimerizzata Ultrafine" : "Inchiostro Dye Anti-sbiadimento" },
                  { name: "Periodo di Garanzia", val: "36 Mesi (Sostituzione Gratuita)" },
                  { name: "Stato di Conservazione", val: "Prodotto in confezione sigillata anti-umidità" }
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">{spec.name}</span>
                    <span className="text-slate-900 font-black text-right text-xs uppercase">{spec.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-[3rem] p-6 lg:p-12 border border-slate-200 shadow-md mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recensioni Verificate</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cosa dicono i nostri clienti professionisti</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
              <span className="text-3xl font-black text-slate-900">5.0</span>
              <div className="space-y-0.5">
                <div className="flex text-yellow-400">
                  <Star fill="currentColor" size={12} />
                  <Star fill="currentColor" size={12} />
                  <Star fill="currentColor" size={12} />
                  <Star fill="currentColor" size={12} />
                  <Star fill="currentColor" size={12} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qualità Certificata</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 divide-y divide-slate-100">
            {reviews.map((rev, idx) => (
              <div key={idx} className={`pt-8 ${idx === 0 ? 'pt-0' : ''} space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm uppercase">{rev.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} fill="currentColor" size={12} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{rev.date}</span>
                    </div>
                  </div>
                  {rev.verified && (
                    <span className="text-[10px] bg-green-50 text-green-700 font-bold uppercase tracking-wider border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Acquisto Verificato
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-xs font-medium leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related / Similar Products Showcase Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Prodotti Consigliati</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Soluzioni e ricambi simili per la tua stampante</p>
              </div>
              <button 
                onClick={() => onNavigate('catalog', product.category)}
                className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                Vedi Tutti <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => {
                const isItemToner = p.category.toLowerCase().includes('toner');
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      onNavigate('product-detail');
                      // Wait! The user can click an item and refresh. We handle it in app parent.
                    }}
                    className="group bg-white rounded-3xl p-5 border border-slate-200 shadow-sm cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden mb-4 relative p-0.5">
                      <ProductImage product={p} />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">{p.brand} COMPATIBILE</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {p.name}
                      </h4>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-slate-950">€{p.price.toFixed(2)}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-blue-600 flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ShoppingCart size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Direct Modal Form overlay (when "Acquista Ora" is clicked) */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col items-stretch relative"
            >
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center font-bold"
              >
                ✕
              </button>

              {orderComplete ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-green-100 animate-bounce">
                    <Check size={40} className="stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ordine Ricevuto Con Successo!</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider max-w-sm mx-auto">
                    La tua transazione è stata protetta ed elaborata in sicurezza da Ink&Print By Denise. Riceverai un'email di conferma con il codice tracking a breve.
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 py-2.5 px-4 rounded-full max-w-xs mx-auto animate-pulse">
                    Spedizione in preparazione - BRT Express
                  </p>
                </div>
              ) : (
                <form onSubmit={submitCheckout} className="p-8 lg:p-12 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Acquisto Diretto e Sicuro</h3>
                    <p className="text-xs text-slate-400 font-medium">Inserisci i dati di fatturazione e ricevi il tuo ordine in 24h.</p>
                  </div>

                  {/* Product Mini Show */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                       <ProductImage product={product} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Totale: €{(product.price * selectedQty).toFixed(2)} (Qta: {selectedQty})</p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome e Cognome / Ragione Sociale *</label>
                        <input 
                          type="text" 
                          required
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          placeholder="Mario Rossi o Nome Azienda"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Assistenza Ordine *</label>
                        <input 
                          type="email" 
                          required
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          placeholder="mario.rossi@esempio.it"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Telefono / Cellulare *</label>
                        <input 
                          type="tel" 
                          required
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder="+39 333 1234567"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Città (CAP) *</label>
                        <input 
                          type="text" 
                          required
                          value={checkoutCity}
                          onChange={(e) => setCheckoutCity(e.target.value)}
                          placeholder="Milano (20121)"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Indirizzo Completo di Spedizione *</label>
                      <input 
                        type="text" 
                        required
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        placeholder="Via Garibaldi 123, Piano 2"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-semibold text-slate-800"
                      />
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Metodo di Pagamento Crittografato</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "stripe", label: "Carta Credito / Debito", img: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
                          { id: "paypal", label: "PayPal Express", img: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
                          { id: "bonifico", label: "Bonifico Bancario", img: "" }
                        ].map(m => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setCheckoutPayment(m.id);
                              setFastPaymentError("");
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${checkoutPayment === m.id ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100'}`}
                          >
                            {m.img ? <img src={m.img} className="h-4 max-w-full opacity-80" alt={m.label} /> : <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Bonifico</span>}
                            <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DYNAMIC CARD PAYMENT SUB-FORM */}
                    {checkoutPayment === "stripe" && (
                      <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 space-y-4 animate-fadeIn text-left">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Dettagli Carta di Credito (Revolut Sicuro)</p>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-550 uppercase tracking-widest">Nome Titolare *</label>
                          <input 
                            type="text"
                            value={fastCardName}
                            onChange={(e) => setFastCardName(e.target.value.toUpperCase())}
                            placeholder="MARIO ROSSI"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:border-blue-500 outline-none text-slate-800 uppercase"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-550 uppercase tracking-widest">Numero Carta *</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              type="text"
                              value={fastCardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
                                setFastCardNumber(formatted);
                              }}
                              placeholder="4000 1234 5678 9010"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-mono font-semibold tracking-wider focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-550 uppercase tracking-widest">Scadenza MM/YY *</label>
                            <input 
                              type="text"
                              value={fastCardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) {
                                  val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                }
                                setFastCardExpiry(val.slice(0, 5));
                              }}
                              placeholder="12/28"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-semibold text-center focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-550 uppercase tracking-widest flex items-center justify-center gap-1">
                              CVV * <Lock size={10} className="text-slate-450" />
                            </label>
                            <input 
                              type="password"
                              value={fastCardCvv}
                              onChange={(e) => setFastCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="***"
                              maxLength={3}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-semibold text-center tracking-widest focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        {/* Simulation Select */}
                        <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/70 space-y-2">
                          <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest leading-none">
                            ⚡ CONTROLLO FONDI SIMULAZIONE REVOLUT
                          </p>
                          <div className="grid grid-cols-1 gap-1.5 pt-1">
                            {[
                              { id: "success", label: "🟢 Fondi Sufficienti", desc: "Simula addebito Revolut autorizzato con successo." },
                              { id: "insufficient_funds", label: "🔴 Fondi Insufficienti", desc: "Nega transazione. L'ordine viene rifiutato." },
                              { id: "declined", label: "❌ Sospetto Frode", desc: "Risoluzione bancaria con blocco di sicurezza." },
                              { id: "cvv", label: "⚠️ CVV Errato", desc: "Negata autorizzazione per credenziali errate." }
                            ].map((opt) => (
                              <label key={opt.id} className="flex items-start gap-2 p-1.5 rounded-lg bg-white border border-slate-100 cursor-pointer shadow-xs hover:border-blue-200 transition-colors">
                                <input 
                                  type="radio" 
                                  name="fast_sim_control" 
                                  checked={fastTestOutcome === opt.id}
                                  onChange={() => setFastTestOutcome(opt.id || "success")}
                                  className="mt-0.5" 
                                />
                                <div className="leading-none flex flex-col">
                                  <span className="text-[9px] font-black text-slate-800 tracking-tight">{opt.label}</span>
                                  <span className="text-[8px] text-slate-450 mt-0.5">{opt.desc}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC PAYPAL EXPRESS SUB-FORM */}
                    {checkoutPayment === "paypal" && (
                      <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 space-y-4 animate-fadeIn text-left">
                        <p className="text-[9px] font-black text-slate-550 uppercase tracking-widest font-mono">PayPal Express login</p>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-505 uppercase tracking-widest">E-mail PayPal *</label>
                          <input 
                            type="email"
                            value={fastPaypalEmail}
                            onChange={(e) => setFastPaypalEmail(e.target.value)}
                            placeholder="mario.rossi@gmail.com"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-505 uppercase tracking-widest">Password *</label>
                          <input 
                            type="password"
                            value={fastPaypalPassword}
                            onChange={(e) => setFastPaypalPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/70 space-y-1">
                          <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest">⚡ CONTROLLO SALDO PAYPAL / REVOLUT</p>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {[
                              { id: "success", label: "🟢 Saldo OK" },
                              { id: "insufficient_funds", label: "🔴 Fondi Zero" }
                            ].map((opt) => (
                              <label key={opt.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100 cursor-pointer shadow-xs hover:border-blue-200 transition-colors">
                                <input 
                                  type="radio" 
                                  name="fast_sim_paypal" 
                                  checked={fastTestOutcome === opt.id}
                                  onChange={() => setFastTestOutcome(opt.id || "success")}
                                />
                                <span className="text-[9px] font-black text-slate-800">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {checkoutPayment === "bonifico" && (
                      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-[10px] text-blue-900 leading-normal space-y-1">
                        <p className="font-extrabold uppercase tracking-widest text-[9px] text-blue-800">Coordinate Bonifico Bancario IT</p>
                        <p><strong>Beneficiario:</strong> Ink&Print By Denise S.r.l.</p>
                        <p><strong>Banca:</strong> Unicredit S.p.A.</p>
                        <p><strong>IBAN:</strong> IT42 N036 6901 6005 1403 9448 155</p>
                        <p><strong>Causale:</strong> Pagamento Ordine (verrà assegnato un codice)</p>
                      </div>
                    )}

                    {/* Fast Payment Error Alert */}
                    {fastPaymentError && (
                      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex gap-3 text-xs text-rose-800 font-medium leading-relaxed animate-fadeIn text-left">
                        <ShieldAlert size={20} className="shrink-0 text-rose-600 self-start mt-0.5" />
                        <div>
                          <p className="font-extrabold uppercase tracking-widest text-[9px] text-rose-900 mb-1">PAGAMENTO NEGATO / AUTORIZZAZIONE FALLITA 🏦</p>
                          <p className="font-black text-slate-900 text-[11px] mb-1">{fastPaymentError}</p>
                          <p className="text-[8px] text-rose-600 font-bold uppercase leading-tight mt-1">
                            ⚠️ Errore di transazione Revolut. L'ordine NON è stato completato e non compare nel sistema.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs font-bold text-slate-400 uppercase">Totale Ordine: <span className="text-slate-900 font-extrabold text-lg">€{(product.price * selectedQty).toFixed(2)}</span></p>
                      
                      {fastIsSubmitting ? (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider animate-pulse">
                          <RefreshCw size={14} className="animate-spin text-blue-600" />
                          <span>Addebito Revolut in corso...</span>
                        </div>
                      ) : (
                        <button 
                          type="submit"
                          className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl shadow-blue-600/30"
                        >
                          Conferma e Ordina
                        </button>
                      )}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
