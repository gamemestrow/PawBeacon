import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CareCategory, Provider, SpeciesType } from '@/types/provider';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return cachedClient;
}

export interface SupabaseProviderRow {
  id: string;
  name: string;
  category: CareCategory;
  tagline: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  distance_km: number;
  phone: string;
  is_24_hours: boolean;
  open_hours: string;
  is_open_now: boolean;
  species: SpeciesType[];
  services: string[];
  fee_range: string;
  rating: number;
  review_count: number;
  verified: boolean;
  wait_minutes: number;
  image_url: string | null;
  created_at: string;
}

export function mapRowToProvider(row: SupabaseProviderRow): Provider {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    address: row.address,
    neighborhood: row.neighborhood,
    city: row.city,
    distanceKm: Number(row.distance_km),
    phone: row.phone,
    is24Hours: row.is_24_hours,
    openHours: row.open_hours,
    isOpenNow: row.is_open_now,
    species: row.species ?? ['Dogs', 'Cats'],
    services: row.services ?? [],
    feeRange: row.fee_range,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    verified: row.verified,
    waitMinutes: row.wait_minutes,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapProviderToRow(provider: Provider): SupabaseProviderRow {
  return {
    id: provider.id,
    name: provider.name,
    category: provider.category,
    tagline: provider.tagline,
    description: provider.description,
    address: provider.address,
    neighborhood: provider.neighborhood,
    city: provider.city,
    distance_km: provider.distanceKm,
    phone: provider.phone,
    is_24_hours: provider.is24Hours,
    open_hours: provider.openHours,
    is_open_now: provider.isOpenNow,
    species: provider.species,
    services: provider.services,
    fee_range: provider.feeRange,
    rating: provider.rating,
    review_count: provider.reviewCount,
    verified: provider.verified,
    wait_minutes: provider.waitMinutes,
    image_url: provider.imageUrl ?? null,
    created_at: provider.createdAt,
  };
}
