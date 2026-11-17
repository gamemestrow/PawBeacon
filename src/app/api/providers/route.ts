import { NextRequest, NextResponse } from 'next/server';
import { addServerProvider, getServerProviders } from '@/lib/mvpServerStore';
import {
  getSupabaseClient,
  mapProviderToRow,
  mapRowToProvider,
  type SupabaseProviderRow,
} from '@/lib/supabaseClient';
import type { CareCategory, Provider, SpeciesType } from '@/types/provider';

const VALID_CATEGORIES: CareCategory[] = [
  'clinic',
  'hospital',
  'boarding',
  'diagnostics',
  'ambulance',
  'ngo',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const category = searchParams.get('category') ?? 'all';

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = (data as SupabaseProviderRow[]).map(mapRowToProvider);
      return NextResponse.json({ providers: mapped, source: 'supabase' });
    }
  }

  let providers = getServerProviders();

  if (category !== 'all' && VALID_CATEGORIES.includes(category as CareCategory)) {
    providers = providers.filter((p) => p.category === category);
  }

  if (query) {
    providers = providers.filter((p) => {
      const haystack = [
        p.name,
        p.tagline,
        p.neighborhood,
        p.address,
        p.services.join(' '),
        p.species.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return NextResponse.json({ providers, source: 'mvp-local' });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Provider>;

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const address = body.address?.trim();
    const category = body.category;

    if (!name || !phone || !address || !category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Please provide clinic name, category, phone number, and street address.' },
        { status: 400 }
      );
    }

    const is24Hours = Boolean(body.is24Hours);
    const openHours =
      body.openHours?.trim() || (is24Hours ? 'Open 24 Hours' : '8:30 AM – 7:30 PM');

    const species: SpeciesType[] =
      Array.isArray(body.species) && body.species.length > 0 ? body.species : ['Dogs', 'Cats'];

    const services =
      Array.isArray(body.services) && body.services.length > 0
        ? body.services
        : ['General Consultation', 'Walk-In Triage'];

    const newProvider: Provider = {
      id: `prov-${Date.now().toString(36)}`,
      name,
      category,
      tagline:
        body.tagline?.trim() ||
        'Newly listed animal care provider accepting appointments and walk-ins',
      description:
        body.description?.trim() ||
        `${name} provides dedicated care for ${species.join(', ').toLowerCase()} in ${
          body.neighborhood?.trim() || 'your neighborhood'
        }.`,
      address,
      neighborhood: body.neighborhood?.trim() || 'Central District',
      city: body.city?.trim() || 'Austin',
      distanceKm: typeof body.distanceKm === 'number' ? body.distanceKm : 1.6,
      phone,
      is24Hours,
      openHours,
      isOpenNow: true,
      species,
      services,
      feeRange: body.feeRange?.trim() || (category === 'ngo' ? 'Free / Donation' : '$40–$70 consult'),
      rating: 5.0,
      reviewCount: 1,
      verified: false,
      waitMinutes: is24Hours ? 10 : 15,
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('providers').insert(mapProviderToRow(newProvider));
      if (!error) {
        return NextResponse.json({ provider: newProvider, source: 'supabase' }, { status: 201 });
      }
    }

    addServerProvider(newProvider);
    return NextResponse.json({ provider: newProvider, source: 'mvp-local' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid provider submission payload.' }, { status: 400 });
  }
}
