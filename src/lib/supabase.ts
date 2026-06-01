import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

// Read configuration from env variables
const supabaseUrlRaw = 
  ((import.meta as any).env?.VITE_SUPABASE_URL) || 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
  '';

const supabaseUrl = supabaseUrlRaw.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

const supabaseAnonKeyRaw = 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  '';

const supabaseAnonKey = supabaseAnonKeyRaw.trim();

// Lazy-initialized or standard client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Checks if Supabase connection details are available.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Gets the configured Supabase connection info for diagnostic displays.
 */
export function getSupabaseConfigInfo() {
  return {
    url: supabaseUrl,
    configured: isSupabaseConfigured(),
    // Mask the anon key for security
    maskedKey: supabaseAnonKey 
      ? `${supabaseAnonKey.slice(0, 8)}...${supabaseAnonKey.slice(-8)}` 
      : 'not configured'
  };
}

/**
 * Reads all products from the "products" table in Supabase.
 * Maps data objects smoothly to our Product interface.
 */
export async function fetchSupabaseProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.");
  }

  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Supabase query error for 'products' table, trying 'prodotti' as fallback:", error);
    // Let's do a fallback to 'prodotti' if 'products' is missing just in case
    const fallbackResult = await supabase
      .from('prodotti')
      .select('*');
    
    if (fallbackResult.error) {
      console.error("Supabase query error on 'prodotti' fallback:", fallbackResult.error);
      throw error; // throw original products table error
    }
    return mapSupabaseToProducts(fallbackResult.data || []);
  }

  return mapSupabaseToProducts(data || []);
}

/**
 * Resiliently maps dynamic database columns to the Product interface.
 */
function mapSupabaseToProducts(data: any[]): Product[] {
  return data.map((item: any) => {
    // Safely collect compatibility array from different possible formats
    let compatibilityArray: string[] = [];
    const rawComp = item.compatibility || item.compatibilita || item.compatible || '';
    
    if (Array.isArray(rawComp)) {
      compatibilityArray = rawComp.map(String);
    } else if (typeof rawComp === 'string') {
      const trimmed = rawComp.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            compatibilityArray = parsed.map(String);
          } else {
            compatibilityArray = [String(parsed)];
          }
        } catch {
          compatibilityArray = trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (trimmed) {
        // Fallback for comma separated strings
        compatibilityArray = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const priceValue = item.price !== undefined ? item.price : (item.prezzo !== undefined ? item.prezzo : 0);
    const category = String(item.category || item.categoria || 'Toner Compatibili');
    const brand = String(item.brand || item.marca || 'Generico');

    // Heuristic image mapping based on category/brand
    let image = String(item.image || item.immagine || item.image_url || '');
    if (!image || image.includes('unsplash.com') || image.includes('placeholder.com')) {
      const catLower = category.toLowerCase();
      const nameLower = String(item.name || item.nome || '').toLowerCase();
      const isCyan = nameLower.includes('cyan') || nameLower.includes('ciano') || nameLower.includes('azure') || nameLower.includes('azzurro') || nameLower.includes('-c') || nameLower.includes(' c ');
      const isMagenta = nameLower.includes('magenta') || nameLower.includes('-m') || nameLower.includes(' m ');
      const isYellow = nameLower.includes('yellow') || nameLower.includes('giallo') || nameLower.includes('-y') || nameLower.includes(' y ');
      const isOriginal = catLower.includes('original');

      if (catLower.includes('inchiostr') || catLower.includes('ink')) {
        image = "/src/assets/images/inkjet_compat_generic_template_1779959041117.png";
      } else if (isOriginal && (catLower.includes('cartucc') || catLower.includes('inkjet'))) {
        image = "/src/assets/images/inkjet_orig_template_2_1779958733126.png";
      } else if (catLower.includes('cartucc')) {
        image = "/src/assets/images/inkjet_compat_generic_template_1779959041117.png";
      } else if (catLower.includes('drum') || catLower.includes('tambur') || catLower.includes('gruppo')) {
        image = "/src/assets/images/drum_unit_premium_template_1779959019359.png";
      } else if (catLower.includes('toner') || catLower.includes('laser')) {
        if (isCyan || isMagenta || isYellow) {
          image = "/src/assets/images/toner_compat_cmy_premium_1779959002014.png";
        } else {
          image = "/src/assets/images/toner_compat_bk_premium_1779958984462.png";
        }
      } else {
        image = "/src/assets/images/toner_compat_bk_premium_1779958984462.png";
      }
    }

    return {
      id: String(item.id || item.sku || item.code || ''),
      sku: String(item.sku || item.code || item.id || ''),
      name: String(item.name || item.nome || item.title || 'Prodotto Senza Nome'),
      category: category,
      brand: brand,
      price: Number(priceValue),
      availability: item.availability !== undefined 
        ? Boolean(item.availability) 
        : (item.disponibilita !== undefined ? Boolean(item.disponibilita) : true),
      compatibility: compatibilityArray,
      description: String(item.description || item.descrizione || ''),
      image: image
    };
  });
}
