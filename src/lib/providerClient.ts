import {
  getSupabaseClient,
  isSupabaseConfigured,
  mapProviderToRow,
  mapRowToProvider,
  type SupabaseProviderRow,
} from '@/lib/supabaseClient';
import { SEED_PROVIDERS } from '@/data/seedProviders';
import type {
  CorrectionField,
  CorrectionReport,
  DirectoryFilters,
  Provider,
} from '@/types/provider';

const LOCAL_PROVIDERS_KEY = 'pawbeacon_mvp_providers_v1';
const LOCAL_CORRECTIONS_KEY = 'pawbeacon_mvp_corrections_v1';

function readLocalProviders(): Provider[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_PROVIDERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Provider[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalProviders(providers: Provider[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_PROVIDERS_KEY, JSON.stringify(providers));
  } catch {
    // Ignore storage quota errors
  }
}

export async function loadProvidersClient(initialProviders: Provider[]): Promise<Provider[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as SupabaseProviderRow[]).map(mapRowToProvider);
    }
  }

  // Zero-key MVP: merge any locally persisted listings/corrections with server seed
  const cached = readLocalProviders();
  if (cached && cached.length >= initialProviders.length) {
    return cached;
  }

  try {
    const res = await fetch('/api/providers', { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as { providers?: Provider[] };
      if (Array.isArray(json.providers) && json.providers.length > 0) {
        writeLocalProviders(json.providers);
        return json.providers;
      }
    }
  } catch {
    // Fallback to hydrated props or seed
  }

  return initialProviders.length > 0 ? initialProviders : SEED_PROVIDERS;
}

export async function createProviderClient(
  payload: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'verified' | 'waitMinutes' | 'createdAt'>
): Promise<Provider> {
  const res = await fetch('/api/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'Could not publish listing.');
  }

  const data = (await res.json()) as { provider: Provider };
  const current = readLocalProviders() ?? SEED_PROVIDERS;
  writeLocalProviders([data.provider, ...current.filter((p) => p.id !== data.provider.id)]);
  return data.provider;
}

export async function submitCorrectionClient(payload: {
  providerId: string;
  field: CorrectionField;
  suggestedValue: string;
  notes: string;
  submittedBy: string;
}): Promise<{ report: CorrectionReport; updatedProvider: Provider | null }> {
  const res = await fetch('/api/corrections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'Could not submit correction.');
  }

  const data = (await res.json()) as {
    report: CorrectionReport;
    updatedProvider: Provider | null;
  };

  if (data.updatedProvider) {
    const current = readLocalProviders() ?? SEED_PROVIDERS;
    const updatedList = current.map((p) =>
      p.id === data.updatedProvider?.id ? data.updatedProvider : p
    );
    writeLocalProviders(updatedList);
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LOCAL_CORRECTIONS_KEY);
      const prev = raw ? (JSON.parse(raw) as CorrectionReport[]) : [];
      window.localStorage.setItem(
        LOCAL_CORRECTIONS_KEY,
        JSON.stringify([data.report, ...prev].slice(0, 50))
      );
    } catch {
      // Ignore storage error
    }
  }

  return data;
}

export function subscribeToProviderUpdates(
  onInsertOrUpdate: (provider: Provider) => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel('providers-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'providers' },
      (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
          onInsertOrUpdate(mapRowToProvider(payload.new as SupabaseProviderRow));
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function saveProvidersLocalCache(providers: Provider[]): void {
  writeLocalProviders(providers);
}

export function filterAndRankProviders(
  providers: Provider[],
  filters: DirectoryFilters
): Provider[] {
  const q = filters.query.trim().toLowerCase();
  const loc = filters.location.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = providers
    .map((provider) => {
      if (filters.category !== 'all' && provider.category !== filters.category) {
        return null;
      }
      if (filters.onlyOpenNow && !provider.isOpenNow) {
        return null;
      }
      if (filters.only24Hours && !provider.is24Hours) {
        return null;
      }
      if (filters.species !== 'all' && !provider.species.includes(filters.species)) {
        return null;
      }
      if (loc) {
        const locHaystack = `${provider.neighborhood} ${provider.address} ${provider.city}`.toLowerCase();
        if (!locHaystack.includes(loc)) {
          return null;
        }
      }

      let score = 0;
      if (tokens.length > 0) {
        const nameLower = provider.name.toLowerCase();
        const servicesLower = provider.services.join(' ').toLowerCase();
        const fullText = [
          provider.name,
          provider.category,
          provider.tagline,
          provider.description,
          provider.neighborhood,
          provider.address,
          provider.species.join(' '),
          provider.services.join(' '),
        ]
          .join(' ')
          .toLowerCase();

        for (const token of tokens) {
          if (!fullText.includes(token)) {
            return null;
          }
          if (nameLower.includes(token)) score += 6;
          if (servicesLower.includes(token)) score += 4;
          score += 1;
        }
      }

      if (provider.verified) score += 1.5;
      if (provider.isOpenNow) score += 1;

      return { provider, score };
    })
    .filter((entry): entry is { provider: Provider; score: number } => entry !== null);

  scored.sort((a, b) => {
    switch (filters.sortBy) {
      case 'nearest':
        return a.provider.distanceKm - b.provider.distanceKm;
      case 'rating':
        return b.provider.rating - a.provider.rating || b.provider.reviewCount - a.provider.reviewCount;
      case 'wait':
        return a.provider.waitMinutes - b.provider.waitMinutes;
      case 'relevance':
      default:
        return b.score - a.score || a.provider.distanceKm - b.provider.distanceKm;
    }
  });

  return scored.map((entry) => entry.provider);
}

export { mapProviderToRow };
