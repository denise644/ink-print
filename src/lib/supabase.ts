import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

// Read configuration from env variables
const supabaseUrl = 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  '';

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
 * Reads all products from the "prodotti" table in Supabase.
 * Maps data objects smoothly to our Product interface.
 */
export async function fetchSupabaseProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.");
  }

  const { data, error } = await supabase
    .from('prodotti')
    .select('*');

  if (error) {
    console.error("Supabase query error:", error);
    throw error;
  }

  if (!data) return [];

  // Map database columns to Product interface if they are named differently
  return data.map((item: any) => ({
    id: String(item.id || item.sku || ''),
    sku: String(item.sku || item.code || item.id || ''),
    name: String(item.name || item.nome || item.title || 'Senza Nome'),
    category: String(item.category || item.categoria || 'Generica'),
    brand: String(item.brand || item.marca || 'Generico'),
    price: Number(item.price || item.prezzo || 0),
    availability: item.availability !== undefined ? Boolean(item.availability) : (item.disponibilita !== undefined ? Boolean(item.disponibilita) : true),
    compatibility: Array.isArray(item.compatibility) 
      ? item.compatibility 
      : (item.compatibilita ? (Array.isArray(item.compatibilita) ? item.compatibilita : [String(item.compatibilita)]) : []),
    description: String(item.description || item.descrizione || ''),
    image: String(item.image || item.immagine || 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=400')
  }));
}
