import React, { useState, useEffect } from 'react';
import { CheckCircle, Printer } from 'lucide-react';

interface ProductImageProps {
  product: {
    id: string;
    sku: string;
    name: string;
    category: string;
    brand: string;
    image?: string;
    images?: string[];
    compatibility?: string[];
  };
  className?: string;
  showDetailsOverlay?: boolean;
  viewIndex?: number; // 0: Main Front, 1: Pure Standalone (no overlays), 2: Technical Label
}

// 1. Strict fallback image arrays per category to enforce proper boundaries and avoid mixups
export const getCategoryImageTemplates = (category: string, brand: string = '', name: string = '') => {
  const catLower = (category || '').toLowerCase();
  const brandLower = (brand || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  const isEpson = brandLower.includes('epson');
  const isCanon = brandLower.includes('canon');
  const isHP = brandLower.includes('hp');
  const isBrother = brandLower.includes('brother');
  const isOriginal = catLower.includes('original');

  // Robust color detection
  const combined = `${nameLower} ${brandLower}`.toLowerCase();
  const isCyan = combined.includes('cyan') || combined.includes('ciano') || combined.includes('azure') || combined.includes('azzurro') || combined.includes('-c') || combined.includes(' c ');
  const isMagenta = combined.includes('magenta') || combined.includes('-m') || combined.includes(' m ');
  const isYellow = combined.includes('yellow') || combined.includes('giallo') || combined.includes('-y') || combined.includes(' y ');
  const isBlack = combined.includes('black') || combined.includes('nero') || combined.includes('bk') || combined.includes('-bk');

  // NEW PREMIUM TEMPLATE ASSETS (User-requested clean style)
  const PREMIUM_INJET_ORIG = [
    "/src/assets/images/inkjet_orig_template_1_1779958716094.png",
    "/src/assets/images/inkjet_orig_template_2_1779958733126.png",
    "/src/assets/images/inkjet_orig_template_3_1779958749399.png",
    "/src/assets/images/inkjet_orig_template_4_1779958767149.png"
  ];
  const PREMIUM_TONER_BK = "/src/assets/images/toner_compat_bk_premium_1779958984462.png";
  const PREMIUM_TONER_CMY = "/src/assets/images/toner_compat_cmy_premium_1779959002014.png";
  const PREMIUM_DRUM = "/src/assets/images/drum_unit_premium_template_1779959019359.png";
  const PREMIUM_INKJET_COMPAT = "/src/assets/images/inkjet_compat_generic_template_1779959041117.png";

  // 1. Inchiostri (Ink Refills)
  if (catLower.includes('inchiostr') || catLower.includes('ink')) {
    return [PREMIUM_INKJET_COMPAT];
  }

  // 2. Inkjet Originali
  if (isOriginal && (catLower.includes('cartucc') || catLower.includes('inkjet'))) {
    const seed = (brandLower.length + nameLower.length) % PREMIUM_INJET_ORIG.length;
    const rotated = [...PREMIUM_INJET_ORIG.slice(seed), ...PREMIUM_INJET_ORIG.slice(0, seed)];
    return rotated;
  }

  // 3. Inkjet Compatibili (Cartucce)
  if (catLower.includes('cartucc') && (!isOriginal || catLower.includes('compatibil'))) {
    return [PREMIUM_INKJET_COMPAT];
  }
  
  // 4. Drum & Tamburi
  if (catLower.includes('drum') || catLower.includes('tambur') || catLower.includes('gruppo')) {
    return [PREMIUM_DRUM];
  }

  // 5. Toner & Laser (Compatibili e Originali)
  if (catLower.includes('toner') || catLower.includes('laser')) {
    if (isCyan || isMagenta || isYellow) return [PREMIUM_TONER_CMY];
    return [PREMIUM_TONER_BK];
  }

  // Generic Color Fallback based on name patterns
  if (isCyan || isMagenta || isYellow) return [PREMIUM_TONER_CMY];
  if (isBlack || combined.includes('nero')) return [PREMIUM_TONER_BK];

  // Absolute Final Universal Backup (Professional Placeholder)
  return [PREMIUM_TONER_BK];
};

// 2. Intelligent, product-first image gallery mapping based strictly on user requirement
export const getProductImageGallery = (product: {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  image?: string;
  images?: string[];
}) => {
  const primary = product.image || '';
  
  // Define what constitutes a "real" product image versus a generic placeholder
  const isGenericPlaceholder = !primary || 
                                primary.includes('unsplash.com') || 
                                primary.includes('placeholder.com') ||
                                primary === '/vite.svg' ||
                                primary === '';

  // If we have a real product image (e.g. from Framatek or specific upload), prioritize it
  if (!isGenericPlaceholder) {
    const alt1 = (product.images && product.images[1]) ? product.images[1] : primary;
    const alt2 = (product.images && product.images[2]) ? product.images[2] : primary;
    return [primary, alt1, alt2];
  }
  
  // Real backup fallback per category and brand context
  const fallback = getCategoryImageTemplates(product.category, product.brand, product.name);
  return fallback.length > 0 ? fallback : ["/src/assets/images/toner_compat_bk_premium_1779958984462.png"];
};

export const ProductImage: React.FC<ProductImageProps> = ({ 
  product, 
  className = "h-full w-full object-contain",
  showDetailsOverlay = false,
  viewIndex = 0
}) => {
  const { brand, sku, category, name } = product;
  const categoryLower = (category || '').toLowerCase();

  const isOriginal = categoryLower.includes('originali') || categoryLower.includes('originale') || categoryLower.includes('original');
  const isToner = categoryLower.includes('toner') || categoryLower.includes('laser');
  const isCartuccia = categoryLower.includes('cartucc');
  const isInchiostro = categoryLower.includes('inchiost') || categoryLower.includes('ink');
  const isDrum = categoryLower.includes('drum') || categoryLower.includes('tambur') || categoryLower.includes('gruppo');
  const isNetwork = categoryLower.includes('network') || categoryLower.includes('lan') || categoryLower.includes('smart') || categoryLower.includes('wifi') || categoryLower.includes('elettron') || categoryLower.includes('accessori');

  const isTonerCompatibile = isToner && !isOriginal;
  const isTonerOriginale = isToner && isOriginal;
  const isCartucciaCompatibile = isCartuccia && !isOriginal;
  const isCartucciaOriginale = isCartuccia && isOriginal;
  const isInchiostroCompatibile = isInchiostro && !isOriginal;

  // Real-time dynamic color specs detection
  const getColorInfo = (pName: string, pSku: string) => {
    const combined = `${pName} ${pSku}`.toLowerCase();
    if (combined.includes('cyan') || combined.includes('ciano') || combined.includes(' - c') || combined.includes('azzur')) {
      return { 
        name: 'CIANO / CYAN', 
        bg: 'bg-cyan-500', 
        text: 'text-cyan-600', 
        border: 'border-cyan-500', 
        badge: 'bg-cyan-100 text-cyan-800',
        hex: '#06b6d4',
        shadow: 'rgba(6, 182, 212, 0.4)'
      };
    }
    if (combined.includes('magenta') || combined.includes(' - m') || combined.includes('rosso')) {
      return { 
        name: 'MAGENTA', 
        bg: 'bg-pink-500', 
        text: 'text-pink-600', 
        border: 'border-pink-500', 
        badge: 'bg-pink-100 text-pink-800',
        hex: '#ec4899',
        shadow: 'rgba(236, 72, 153, 0.4)'
      };
    }
    if (combined.includes('yellow') || combined.includes('giallo') || combined.includes(' - y')) {
      return { 
        name: 'GIALLO / YELLOW', 
        bg: 'bg-yellow-500', 
        text: 'text-yellow-650', 
        border: 'border-yellow-550', 
        badge: 'bg-yellow-100 text-yellow-850',
        hex: '#eab308',
        shadow: 'rgba(234, 179, 8, 0.4)'
      };
    }
    return { 
      name: 'NERO / BLACK', 
      bg: 'bg-slate-900', 
      text: 'text-slate-900', 
      border: 'border-slate-950', 
      badge: 'bg-slate-100 text-slate-800',
      hex: '#0f172a',
      shadow: 'rgba(15, 23, 42, 0.4)'
    };
  };

  const colorInfo = React.useMemo(() => getColorInfo(name, sku), [name, sku]);

  // Dynamic capacity metric calculation based on product attributes
  const getPageYield = () => {
    const combined = name.toLowerCase();
    if (isToner) {
      if (combined.includes('xl') || combined.includes('high') || combined.includes('alta')) {
        return '~6.000 COPPIE (ISO STANDARD)';
      }
      return '~2.600 COPPIE (ISO STANDARD)';
    } else if (isDrum) {
      return '~12.000 PAGINE (Alta Durata)';
    } else {
      if (combined.includes('xl') || combined.includes('alta')) {
        return '~1.200 PAGINE (Alta Resa)';
      }
      return '~450 PAGINE (Resa Standard)';
    }
  };

  const pageYield = React.useMemo(() => getPageYield(), [name, isToner, isDrum]);

  const [activeImage, setActiveImage] = useState<string>('');

  const handleImageError = () => {
    const templates = getCategoryImageTemplates(category, brand, name);
    setActiveImage(templates[0]);
  };

  useEffect(() => {
    const initialGallery = getProductImageGallery(product);
    const initialImg = initialGallery[viewIndex] || initialGallery[0];
    
    // Prioritize real images over generic ones instantly without network overhead
    setActiveImage(initialImg || "/src/assets/images/toner_compat_bk_premium_1779958984462.png");
  }, [product, viewIndex]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', product.id);
  };

  // ==========================================
  // VIEW INDEX 1: Pure Standalone View (Clean)
  // ==========================================
  if (viewIndex === 1) {
    return (
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center bg-white select-none overflow-hidden rounded-2xl border border-slate-100/40 shadow-inner p-4"
        id={`ai-product-clean-container-${product.id}`}
      >
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="text-[7.5px] font-black tracking-widest text-[#0f172a] font-sans uppercase">
            Q.C. QUALITY INSPECTED
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className="bg-slate-50 text-slate-600 font-bold text-[7px] px-2 py-0.5 rounded uppercase leading-none border border-slate-100">
            ★ PRODOTTO CONFORME
          </span>
        </div>

        <div className="relative w-full flex-1 flex items-center justify-center p-2">
          <img 
            src={activeImage || undefined}
            alt={name}
            onError={handleImageError}
            className={`${className} max-h-[85%] max-w-[85%] object-contain select-none transition-transform duration-500 hover:scale-[1.03] mix-blend-multiply`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        <div className="w-full border-t border-slate-100/60 pt-2 flex items-center justify-between mt-auto z-10 text-[6.5px] font-mono text-slate-400 uppercase font-semibold">
          <span>{brand.toUpperCase()} SELECTION</span>
          <span className="text-right">CALIBRATION PASS ISO-9001</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW INDEX 2: Technical Specifications Sticker
  // ==========================================
  if (viewIndex === 2) {
    return (
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center bg-white select-none overflow-hidden rounded-2xl border border-slate-100/40 shadow-inner p-4"
        id={`ai-product-detail-sticker-${product.id}`}
      >
        <div 
          className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: colorInfo.hex }}
        />

        <div 
          className="absolute shadow-xl border border-slate-250 p-4 flex flex-col justify-between bg-white text-left pointer-events-none select-none"
          style={{
            left: '3%',
            top: '3%',
            width: '94%',
            height: '94%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 0 15px rgba(0,0,0,0.01)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-2 shrink-0">
            <div>
              <span className="text-[10px] font-black tracking-widest text-slate-800 font-sans uppercase">
                {isOriginal ? "ORIGINAL BRAND VERIFICATION SHEET" : "COMPATIBLE PRODUCT SPECIFICATION"}
              </span>
              <p className="text-[7.5px] font-mono text-slate-400 font-semibold uppercase leading-tight mt-0.5">
                {isOriginal ? `${brand.toUpperCase()} OFFICIAL CONSUMABLE STANDARDS` : "INK&PRINT BY DENISE PARTNER LABS • ACCREDITED QUALITY CERTIFIED"}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[7px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
              <CheckCircle size={7} /> {isOriginal ? "AUTHENTIC OEM" : "Q.C. PASSED"}
            </div>
          </div>

          {/* Model info details */}
          <div className="flex-1 flex flex-col justify-center my-3 gap-3">
            <div>
              <span className="text-[7.5px] text-slate-400 font-bold uppercase block tracking-wider">PRODUCT TYPE / MODELLO</span>
              <span className="text-[14px] font-black tracking-tight text-slate-900 font-mono block leading-none mt-1 uppercase">
                {isTonerOriginale ? "ORIGINAL LASER TONER CARTRIDGE" : 
                 isTonerCompatibile ? "COMPATIBLE LASER TONER" : 
                 isCartucciaOriginale ? "ORIGINAL INKJET CARTRIDGE" :
                 isCartucciaCompatibile ? "HIGH-DENSITY COMPATIBLE INKJET" : 
                 isInchiostroCompatibile ? "REFILL LIQUID DYE INK" :
                 isDrum ? "REPLACEMENT DRUM CARTRIDGE" : "COMPATIBLE REPLACEMENT"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
              <div>
                <span className="text-[7px] text-slate-400 font-bold uppercase block tracking-wider">COLORE / COLOR</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-3.5 h-3.5 rounded-full ${colorInfo.bg} border border-slate-300 shadow-sm shrink-0`} />
                  <span className="text-[9px] font-mono font-bold text-slate-700 uppercase">{colorInfo.name}</span>
                </div>
              </div>
              <div>
                <span className="text-[7px] text-slate-400 font-bold uppercase block tracking-wider">EXPECTED YIELD / COPY</span>
                <span className="text-[9px] font-mono font-bold text-slate-700 uppercase mt-1 block">{pageYield}</span>
              </div>
            </div>
          </div>

          {/* Barcode Footer */}
          <div className="border-t border-dashed border-slate-250 pt-2 flex items-center justify-between shrink-0">
            <div className="flex flex-col">
              <span className="text-[12px] font-serif tracking-[1px] font-bold text-slate-800 leading-none select-none opacity-85 font-mono">
                ||||| | ||||| | || ||||| | | ||||| ||| ||| | |||
              </span>
              <span className="text-[6px] font-mono text-slate-400 font-bold tracking-[2.5px] mt-0.5">
                {isDrum ? "(801) 90293-DRUM-COMPAT-HUB" : 
                 (isInchiostro || isCartuccia) ? `(801) 90293-${brand.toUpperCase()}-INK-SERIES` :
                 (isOriginal ? `(801) 90293-${brand.toUpperCase()}-ORIGINAL-PRO` : `(801) 90293-${sku}-COMPAT-HUB`)}
              </span>
            </div>
            
            <div className="text-[6.5px] text-amber-500 font-mono uppercase font-black tracking-tight">
              {isOriginal ? "OFFICIAL DISTRIBUTION MERCHANDISE" : "INK&PRINT BY DENISE GLOBAL • STANDARDS COMPLIANT"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW INDEX 0: Gorgeous Overlay Presentation
  // ==========================================

  // Determine header and badge styling based on category isolation
  let seriesTitle = "UNIVERSAL CONSUMABLES";
  let productTypeDisplay = "COMPATIBLE ACCESSORY";
  let statusBadgeText = "TESTED OK";
  let statusBadgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100/40";
  let isGoldTheme = false;

  if (isTonerOriginale) {
    seriesTitle = "AUTHENTIC ORIGINAL TONER";
    productTypeDisplay = "ORIGINAL OEM TONER";
    statusBadgeText = "ORIGINALE";
    statusBadgeBg = "bg-amber-50 text-amber-700 border-amber-200/40 animate-pulse";
    isGoldTheme = true;
  } else if (isTonerCompatibile) {
    seriesTitle = "LASER TONER COHERENT SERIES";
    productTypeDisplay = "COMPATIBLE TONER";
    statusBadgeText = "HIGH CAP LASER";
    statusBadgeBg = "bg-rose-50 text-rose-700 border-rose-100/40";
  } else if (isCartucciaOriginale) {
    seriesTitle = "OEM GENUINE INK CARTRIDGE";
    productTypeDisplay = "ORIGINAL INKJET";
    statusBadgeText = "ORIGINALE";
    statusBadgeBg = "bg-amber-50 text-amber-700 border-amber-200/40 animate-pulse";
    isGoldTheme = true;
  } else if (isCartucciaCompatibile) {
    seriesTitle = "INKJET PREMIUM SERIES";
    productTypeDisplay = "INKJET COMPATIBILE";
    statusBadgeText = "MICRO FLUID PASS";
    statusBadgeBg = "bg-blue-50 text-blue-700 border-blue-100/40";
  } else if (isInchiostroCompatibile) {
    seriesTitle = "ECOTANK REFILL LIQUID SERIES";
    productTypeDisplay = "INCHIOSTRO COMPATIBILE";
    statusBadgeText = "HIGH PURITY DYE";
    statusBadgeBg = "bg-cyan-50 text-cyan-700 border-cyan-100/40";
  } else if (isDrum) {
    seriesTitle = "PHOTO-CONDUCTOR DRUM MODULE";
    productTypeDisplay = "DRUM UNIT PERFORMANCE";
    statusBadgeText = "12000 PAG CARTRIDGE";
    statusBadgeBg = "bg-purple-50 text-purple-700 border-purple-100/40";
  }

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center bg-white select-none overflow-hidden rounded-2xl border border-slate-100/40 shadow-inner p-4"
      id={`ai-product-main-presentation-${product.id}`}
    >
      {/* Decorative Blur Background Glows */}
      <div 
        className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: isGoldTheme ? '#eab308' : colorInfo.hex }}
      />
      <div 
        className="absolute -left-12 -top-12 w-48 h-48 rounded-full blur-2xl opacity-[0.04] pointer-events-none"
        style={{ backgroundColor: colorInfo.hex }}
      />

      {/* Styled Card Header */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isGoldTheme ? '#eab308' : colorInfo.hex }} />
        <span className="text-[7.5px] font-black tracking-widest text-[#0f172a] font-sans uppercase">
          {seriesTitle}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-1">
        <span className={`font-bold text-[7px] px-1.5 py-0.5 rounded uppercase leading-none border ${statusBadgeBg}`}>
          {statusBadgeText}
        </span>
        <span className="bg-slate-900 text-white font-bold text-[7px] px-1.5 py-0.5 rounded uppercase leading-none">
          {colorInfo.name.split(' / ')[0]}
        </span>
      </div>

      {/* Center Image Container */}
      <div className="relative w-full flex-1 flex items-center justify-center p-2">
        <img 
          src={activeImage || undefined}
          alt={name}
          onError={handleImageError}
          className={`${className} max-h-[85%] max-w-[85%] object-contain select-none transition-transform duration-350 hover:scale-[1.04] mix-blend-multiply`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>

      {/* Premium E-Commerce Styled Overlay Sticker Box */}
      {!isNetwork && (
        isGoldTheme ? (
          <div 
            className="absolute p-2 flex flex-col justify-between text-left select-none pointer-events-none rounded bg-[#0f172a] text-white"
            style={{
              left: '9%',
              bottom: '18%',
              width: '38%',
              height: '35%',
              border: '1.5px solid #d4af37', // luxury golden metallic look
              boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
              transform: 'perspective(600px) rotateY(4deg) rotateZ(-0.5deg)',
            }}
          >
            <div className="flex flex-col border-b border-dashed border-slate-700 pb-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[7.5px] font-black tracking-widest text-[#fbbf24] font-sans uppercase">
                  {brand.toUpperCase()} AUTHENTIC
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse shadow-[0_0_4px_#fbbf24]" />
              </div>
            </div>

            <div className="my-auto py-0.5">
              <h4 className="text-[9.5px] md:text-[10px] font-black text-white tracking-widest uppercase font-mono leading-none truncate">
                {isToner ? "ORIGINAL TONER" : "ORIGINAL INK"}
              </h4>
              <span className="text-[4.5px] font-mono text-slate-400 font-bold block tracking-widest mt-0.5 uppercase">
                GENUINE CONSUMABLE
              </span>
            </div>

            <div className="flex items-center justify-between text-[4.5px] border-t border-slate-800 pt-0.5 shrink-0">
              <span className="px-1 py-0.25 rounded-[2px] text-[4.5px] font-bold bg-amber-500/10 text-amber-400 uppercase tracking-tight">
                {colorInfo.name.split(' / ')[0]}
              </span>
              <span className="text-[4.5px] font-mono text-[#fbbf24] font-extrabold uppercase">ORIGINAL ✓</span>
            </div>
          </div>
        ) : (
          <div 
            className="absolute shadow-lg border border-slate-200/40 rounded-lg p-2.5 flex flex-col justify-between bg-white text-left select-none pointer-events-none"
            style={{
              left: '8.5%',
              bottom: '22%',
              width: '38%',
              height: '38%',
              boxShadow: '2px 4px 12px rgba(15, 23, 42, 0.12), inset 0 0 4px rgba(0,0,0,0.03)',
              transform: 'perspective(600px) rotateY(4deg) rotateZ(-0.5deg)',
            }}
          >
            <div className="flex flex-col border-b border-dashed border-slate-150 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black tracking-widest text-slate-800 font-sans uppercase">
                  INK&PRINT BY DENISE
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${colorInfo.bg}`} />
              </div>
            </div>

            <div className="my-auto py-1">
              <h4 className="text-[11px] md:text-[12.5px] font-black text-rose-600 tracking-tight uppercase font-mono leading-none truncateSpecial">
                {isToner ? "COMPATIBLE TONER" : isCartuccia ? "COMPATIBLE INK" : isInchiostro ? "REFILL INK JET" : isDrum ? "COMPATIBLE DRUM" : "PRO COMPATIBLE"}
              </h4>
              <span className="text-[5.5px] font-mono text-slate-400 font-bold block tracking-wider mt-1 uppercase leading-none">
                PREMIUM SELECTION • CERTIFIED
              </span>
            </div>

            <div className="flex items-center justify-between text-[5.5px] border-t border-slate-100 pt-1 shrink-0">
              <span className={`px-1 py-0.5 rounded-[3px] text-[5px] font-bold ${colorInfo.badge} uppercase scale-90 origin-left tracking-tight shrink-0`}>
                {colorInfo.name.split(' / ')[0]}
              </span>
              <span className="text-[5.5px] font-mono text-emerald-600 font-bold uppercase tracking-tighter">100% OK</span>
            </div>
          </div>
        )
      )}

      {/* Styled Footer */}
      <div className="w-full border-t border-slate-100/60 pt-2 flex items-center justify-between mt-auto z-10">
        <div className="flex flex-col text-left">
          <span className="text-[5.5px] text-slate-400 font-bold uppercase">CATEGORIA PRODOTTO</span>
          <span className="text-[8.5px] font-extrabold text-slate-700 uppercase">{productTypeDisplay}</span>
        </div>
        <div className="text-right">
          <span className="text-[5.5px] text-slate-400 font-bold block uppercase font-mono">RENDIMENTO PREDETTO</span>
          <span className="text-[8.5px] font-mono font-bold text-slate-700 block text-right">
            {pageYield}
          </span>
        </div>
      </div>

      {/* Optional fallback overlay */}
      {showDetailsOverlay && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white p-1 text-[9px] text-center font-mono z-20">
          PRODOTTO 100% VERIFICATO • NO MIXUPS GUARANTEED
        </div>
      )}
    </div>
  );
};
