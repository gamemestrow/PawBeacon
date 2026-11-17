'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Ambulance,
  Building2,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Home,
  MapPin,
  Microscope,
  RotateCcw,
  Search,
  Siren,
  Stethoscope,
} from 'lucide-react';
import { ListBusinessDrawer } from '@/components/ListBusinessDrawer';
import { Navbar } from '@/components/Navbar';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import { ProviderCard } from '@/components/ProviderCard';
import { ProviderDetailDrawer } from '@/components/ProviderDetailDrawer';
import {
  createProviderClient,
  filterAndRankProviders,
  loadProvidersClient,
  saveProvidersLocalCache,
  submitCorrectionClient,
  subscribeToProviderUpdates,
} from '@/lib/providerClient';
import {
  CATEGORY_META,
  type CareCategory,
  type CorrectionField,
  type DirectoryFilters,
  type Provider,
  type SortOption,
  type SpeciesType,
  type UserRole,
  type UserSession,
} from '@/types/provider';

interface DiscoveryAppProps {
  initialProviders: Provider[];
}

const SESSION_STORAGE_KEY = 'pawbeacon_mvp_session_v1';

const CATEGORY_OPTIONS: Array<{
  id: CareCategory | 'all';
  label: string;
}> = [
  { id: 'all', label: 'All Care' },
  { id: 'clinic', label: 'Vet Clinics' },
  { id: 'hospital', label: '24/7 Hospitals' },
  { id: 'boarding', label: 'Boarding' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'ambulance', label: 'Ambulances' },
  { id: 'ngo', label: 'NGOs & Shelters' },
];

const QUICK_SEARCH_TERMS = ['24/7 Trauma', 'Digital X-Ray', 'Cat Boarding', 'Pet Ambulance', 'Stray Rescue'];

const DEFAULT_FILTERS: DirectoryFilters = {
  query: '',
  location: '',
  category: 'all',
  onlyOpenNow: false,
  only24Hours: false,
  species: 'all',
  sortBy: 'relevance',
};

function getCategoryIcon(category: CareCategory | 'all') {
  switch (category) {
    case 'clinic':
      return Stethoscope;
    case 'hospital':
      return Siren;
    case 'boarding':
      return Home;
    case 'diagnostics':
      return Microscope;
    case 'ambulance':
      return Ambulance;
    case 'ngo':
      return HeartHandshake;
    default:
      return Search;
  }
}

export function DiscoveryApp({ initialProviders }: DiscoveryAppProps) {
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [filters, setFilters] = useState<DirectoryFilters>(DEFAULT_FILTERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [listBusinessOpen, setListBusinessOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const directoryRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3600);
  }

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const loaded = await loadProvidersClient(initialProviders);
      if (active) {
        setProviders(loaded);
      }
    }

    void hydrate();

    // Restore local demo session if present
    try {
      const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as UserSession;
        if (parsed && parsed.id) {
          setSession(parsed);
        }
      }
    } catch {
      // Ignore storage error
    }

    const unsubscribe = subscribeToProviderUpdates((incoming) => {
      setProviders((prev) => {
        const exists = prev.some((p) => p.id === incoming.id);
        const next = exists
          ? prev.map((p) => (p.id === incoming.id ? incoming : p))
          : [incoming, ...prev];
        saveProvidersLocalCache(next);
        return next;
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [initialProviders]);

  function persistSession(nextSession: UserSession | null) {
    setSession(nextSession);
    try {
      if (nextSession) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage error
    }
  }

  const filteredProviders = useMemo(
    () => filterAndRankProviders(providers, filters),
    [providers, filters]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<CareCategory | 'all', number> = {
      all: providers.length,
      clinic: 0,
      hospital: 0,
      boarding: 0,
      diagnostics: 0,
      ambulance: 0,
      ngo: 0,
    };
    for (const p of providers) {
      counts[p.category] += 1;
    }
    return counts;
  }, [providers]);

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? null,
    [providers, selectedProviderId]
  );

  const hasActiveFilters =
    filters.query !== '' ||
    filters.location !== '' ||
    filters.category !== 'all' ||
    filters.onlyOpenNow ||
    filters.only24Hours ||
    filters.species !== 'all';

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleHeroSearchSubmit(e: FormEvent) {
    e.preventDefault();
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExploreServices() {
    setFilters(DEFAULT_FILTERS);
    scrollToSection('services-spotlight');
  }

  function handleDemoSignIn(role: UserRole, customName?: string, customEmail?: string) {
    const nextSession: UserSession = {
      id: `user-${Date.now().toString(36)}`,
      name:
        customName ||
        (role === 'provider_partner' ? 'Dr. Elena Brooks' : 'Sam Rivera'),
      email:
        customEmail ||
        (role === 'provider_partner' ? 'clinic@pawbeacon.local' : 'sam@pawbeacon.local'),
      role,
      savedProviderIds: session?.savedProviderIds ?? ['prov-beacon-icu'],
      submittedProviderIds: session?.submittedProviderIds ?? [],
    };
    persistSession(nextSession);
    showToast(`Signed in as ${nextSession.name}`);
  }

  function handleSwitchRole(role: UserRole) {
    if (!session) return;
    persistSession({ ...session, role });
    showToast(role === 'provider_partner' ? 'Switched to Care Provider view' : 'Switched to Pet Parent view');
  }

  function handleSignOut() {
    persistSession(null);
    setProfileOpen(false);
    showToast('Signed out');
  }

  function handleToggleSave(providerId: string) {
    if (!session) {
      const quickSession: UserSession = {
        id: `user-${Date.now().toString(36)}`,
        name: 'Sam Rivera',
        email: 'sam@pawbeacon.local',
        role: 'pet_parent',
        savedProviderIds: [providerId],
        submittedProviderIds: [],
      };
      persistSession(quickSession);
      showToast('Saved provider to your quick profile');
      return;
    }

    const exists = session.savedProviderIds.includes(providerId);
    const nextSaved = exists
      ? session.savedProviderIds.filter((id) => id !== providerId)
      : [...session.savedProviderIds, providerId];

    persistSession({ ...session, savedProviderIds: nextSaved });
    showToast(exists ? 'Removed from saved providers' : 'Saved to your profile');
  }

  function handleCallProvider(provider: Provider) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(provider.phone).catch(() => {});
    }
    showToast(`Ready to call ${provider.name}: ${provider.phone}`);
  }

  async function handleCreateProvider(
    payload: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'verified' | 'waitMinutes' | 'createdAt'>
  ) {
    const created = await createProviderClient(payload);
    setProviders((prev) => {
      const next = [created, ...prev.filter((p) => p.id !== created.id)];
      saveProvidersLocalCache(next);
      return next;
    });

    if (session) {
      persistSession({
        ...session,
        submittedProviderIds: [created.id, ...session.submittedProviderIds],
      });
    }

    setFilters({ ...DEFAULT_FILTERS, category: created.category });
    showToast(`${created.name} is now live in the directory`);
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmitCorrection(payload: {
    providerId: string;
    field: CorrectionField;
    suggestedValue: string;
    notes: string;
    submittedBy: string;
  }) {
    const { updatedProvider } = await submitCorrectionClient(payload);
    if (updatedProvider) {
      setProviders((prev) => {
        const next = prev.map((p) => (p.id === updatedProvider.id ? updatedProvider : p));
        saveProvidersLocalCache(next);
        return next;
      });
    }
    showToast('Listing detail updated via community correction');
  }

  return (
    <div id="top" className="min-h-screen bg-[#FFFDF7] text-[#1C1917]">
      <Navbar
        session={session}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenListBusiness={() => setListBusinessOpen(true)}
        onScrollToSection={scrollToSection}
      />

      <main>
        {/* Search-First Hero Section */}
        <section className="border-b border-[#E7E5E4] bg-[#FAF6EB]/65">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Hero Copy & CTA Focus */}
              <div className="flex flex-col justify-center lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">
                  Verified Local Animal Care Directory
                </p>
                <h1
                  className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-[#1C1917]"
                  style={{ textWrap: 'balance' }}
                >
                  Find trusted animal care the moment your pet needs it.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
                  Search veterinary clinics, 24/7 emergency hospitals, boarding suites, diagnostic
                  labs, pet ambulances, and local rescue NGOs—built for instant mobile triage with
                  transparent hours and fees.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      searchInputRef.current?.focus();
                      scrollToSection('directory');
                    }}
                    className="min-h-[48px] rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F59E0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]"
                  >
                    Find a Vet
                  </button>
                  <button
                    type="button"
                    onClick={handleExploreServices}
                    className="min-h-[48px] rounded-xl border border-[#D6D3D1] bg-white px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:border-[#F59E0B] hover:bg-[#FEFCE8]"
                  >
                    Explore Services
                  </button>
                  <button
                    type="button"
                    onClick={() => setListBusinessOpen(true)}
                    className="min-h-[48px] px-3 py-3 text-sm font-semibold text-[#B45309] underline-offset-4 hover:underline"
                  >
                    List Your Business
                  </button>
                </div>
              </div>

              {/* Hero Visual Asset */}
              <div className="lg:col-span-5">
                <div className="relative h-64 overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#F5EFE0] sm:h-80 lg:h-full lg:min-h-[300px]">
                  <img
                    src="/images/hero_vet_care.jpg"
                    alt="Veterinarian gently examining a golden retriever in a sunlit clinic"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1917]/80 via-[#1C1917]/35 to-transparent p-5 text-white">
                    <div className="font-mono-tabular text-xs font-medium text-[#FDE047]">
                      6 Care Categories · Zero API Key MVP
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      Instant local search with community-verified hours & triage wait times
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Search Command Bar */}
            <form
              onSubmit={handleHeroSearchSubmit}
              className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-3 shadow-xs sm:p-4"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="relative md:col-span-5">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#78716C]"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    aria-label="Search clinics, services, or symptoms"
                    value={filters.query}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, query: e.target.value }))
                    }
                    placeholder="Search clinic, X-ray, cat boarding, ambulance..."
                    className="min-h-[48px] w-full rounded-xl border border-[#E7E5E4] bg-[#FFFDF7] pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#F59E0B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="relative md:col-span-3">
                  <MapPin
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#78716C]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    aria-label="Filter by neighborhood or address"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Neighborhood (e.g., Zilker)"
                    className="min-h-[48px] w-full rounded-xl border border-[#E7E5E4] bg-[#FFFDF7] pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#F59E0B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center md:col-span-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, only24Hours: !prev.only24Hours }))
                    }
                    aria-pressed={filters.only24Hours}
                    className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      filters.only24Hours
                        ? 'border-[#1C1917] bg-[#1C1917] text-[#FACC15]'
                        : 'border-[#E7E5E4] bg-[#FAF6EB] text-[#1C1917] hover:border-[#F59E0B]'
                    }`}
                  >
                    <Siren className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>24/7 Urgent</span>
                  </button>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="min-h-[48px] w-full rounded-xl bg-[#FACC15] px-5 text-sm font-semibold text-[#1C1917] whitespace-nowrap transition-colors hover:bg-[#F59E0B]"
                  >
                    Search Care
                  </button>
                </div>
              </div>

              {/* Quick Search Suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#F5F5F4] pt-3 text-xs text-[#57534E]">
                <span className="font-medium text-[#78716C]">Popular searches:</span>
                {QUICK_SEARCH_TERMS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        query: term === '24/7 Trauma' ? 'Trauma' : term,
                        only24Hours: term === '24/7 Trauma' ? true : prev.only24Hours,
                      }));
                      scrollToSection('directory');
                    }}
                    className="min-h-[32px] rounded-lg px-2.5 py-1 font-medium text-[#1C1917] transition-colors hover:bg-[#FEFCE8] hover:text-[#B45309]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* Live Searchable Directory */}
        <section
          id="directory"
          ref={directoryRef}
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
        >
          {/* Horizontal Scrollable Category Tabs */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#1C1917] sm:text-2xl">
              Live Animal-Care Directory
            </h2>
            <span className="font-mono-tabular text-xs font-medium text-[#57534E]">
              {filteredProviders.length} of {providers.length} providers
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Filter by animal care category"
            className="no-scrollbar -mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            {CATEGORY_OPTIONS.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isActive = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
                  className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                    isActive
                      ? 'border-[#F59E0B] bg-[#FACC15] text-[#1C1917]'
                      : 'border-[#E7E5E4] bg-white text-[#57534E] hover:border-[#D6D3D1] hover:text-[#1C1917]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{cat.label}</span>
                  <span
                    className={`font-mono-tabular text-xs ${
                      isActive ? 'text-[#1C1917]' : 'text-[#78716C]'
                    }`}
                  >
                    {categoryCounts[cat.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Faceted Filter Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E7E5E4] bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={filters.onlyOpenNow}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, onlyOpenNow: !prev.onlyOpenNow }))
                }
                className={`flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  filters.onlyOpenNow
                    ? 'border-[#F59E0B] bg-[#FEFCE8] text-[#1C1917]'
                    : 'border-[#E7E5E4] bg-[#FFFDF7] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
                <span>Open Now</span>
              </button>

              <select
                aria-label="Filter by species"
                value={filters.species}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    species: e.target.value as SpeciesType | 'all',
                  }))
                }
                className="min-h-[40px] rounded-xl border border-[#E7E5E4] bg-[#FFFDF7] px-3 text-xs font-semibold text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="all">All Species</option>
                <option value="Dogs">Dogs</option>
                <option value="Cats">Cats</option>
                <option value="Birds">Birds</option>
                <option value="Exotics">Exotics</option>
                <option value="Livestock">Livestock</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-[#B45309] hover:bg-[#FEFCE8]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-providers" className="text-xs font-medium text-[#78716C]">
                Sort
              </label>
              <select
                id="sort-providers"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
                }
                className="min-h-[40px] rounded-xl border border-[#E7E5E4] bg-[#FFFDF7] px-3 text-xs font-semibold text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="relevance">Best Match</option>
                <option value="nearest">Nearest Distance</option>
                <option value="rating">Highest Rated</option>
                <option value="wait">Shortest Wait</option>
              </select>
            </div>
          </div>

          {/* Directory Results Grid */}
          {filteredProviders.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#D6D3D1] bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-[#1C1917]">
                No animal-care providers match those filters
              </h3>
              <p className="mt-1.5 text-sm text-[#57534E]">
                Try broadening your neighborhood, clearing the 24/7 filter, or resetting all search
                terms.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-5 min-h-[44px] rounded-xl bg-[#FACC15] px-5 py-2.5 text-sm font-semibold text-[#1C1917] hover:bg-[#F59E0B]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSaved={Boolean(session?.savedProviderIds.includes(provider.id))}
                  onSelect={(item) => setSelectedProviderId(item.id)}
                  onToggleSave={handleToggleSave}
                  onCall={handleCallProvider}
                />
              ))}
            </div>
          )}
        </section>

        {/* Explore Services Spotlight & Business CTA */}
        <section
          id="services-spotlight"
          className="border-t border-[#E7E5E4] bg-[#FAF6EB]/70 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
                Explore Specialized Animal-Care Services
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E] sm:text-base">
                Jump directly into urgent trauma care, calm medical boarding, diagnostic labs,
                ambulance dispatch, or verified rescue NGOs.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setFilters({ ...DEFAULT_FILTERS, category: 'hospital', only24Hours: true });
                  scrollToSection('directory');
                }}
                className="group overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white text-left transition-colors hover:border-[#F59E0B]"
              >
                <img
                  src="/images/care_hospital_icu.jpg"
                  alt="24/7 veterinary emergency hospital suite"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <div className="text-xs font-semibold text-[#B45309]">
                    {CATEGORY_META.hospital.label}
                  </div>
                  <div className="mt-1 text-base font-bold text-[#1C1917] group-hover:text-[#B45309]">
                    24/7 Trauma ICU & Diagnostics
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    {CATEGORY_META.hospital.description}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilters({ ...DEFAULT_FILTERS, category: 'boarding' });
                  scrollToSection('directory');
                }}
                className="group overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white text-left transition-colors hover:border-[#F59E0B]"
              >
                <img
                  src="/images/care_boarding_lounge.jpg"
                  alt="Sunlit pet boarding suite with comfortable bedding"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <div className="text-xs font-semibold text-[#B45309]">
                    {CATEGORY_META.boarding.label}
                  </div>
                  <div className="mt-1 text-base font-bold text-[#1C1917] group-hover:text-[#B45309]">
                    Safe Boarding & Recovery Stays
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    {CATEGORY_META.boarding.description}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilters({ ...DEFAULT_FILTERS, category: 'ngo' });
                  scrollToSection('directory');
                }}
                className="group overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white text-left transition-colors hover:border-[#F59E0B]"
              >
                <img
                  src="/images/care_ngo_rescue.jpg"
                  alt="Animal rescue volunteer holding a rescued puppy"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <div className="text-xs font-semibold text-[#B45309]">
                    {CATEGORY_META.ngo.label}
                  </div>
                  <div className="mt-1 text-base font-bold text-[#1C1917] group-hover:text-[#B45309]">
                    Rescue Squads & Animal NGOs
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    {CATEGORY_META.ngo.description}
                  </p>
                </div>
              </button>
            </div>

            {/* List Your Business Callout Banner */}
            <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#E7E5E4] bg-[#1C1917] p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FACC15]">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  <span>For Clinics, Ambulances, Labs & NGOs</span>
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                  Help local pet parents find your services in seconds.
                </h3>
                <p className="mt-1.5 text-sm text-[#D6D3D1]">
                  Publish your verified hours, emergency availability, species treated, and direct
                  phone line directly into the live directory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setListBusinessOpen(true)}
                className="min-h-[48px] shrink-0 rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-semibold text-[#1C1917] whitespace-nowrap transition-colors hover:bg-[#F59E0B]"
              >
                List Your Business
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E7E5E4] bg-[#FFFDF7] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 text-xs text-[#57534E] sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <span className="font-semibold text-[#1C1917]">PawBeacon</span> · Animal-Care
            Discovery MVP
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => {
                setFilters({ ...DEFAULT_FILTERS, category: 'ambulance' });
                scrollToSection('directory');
              }}
              className="hover:text-[#1C1917] hover:underline"
            >
              Pet Ambulances
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ ...DEFAULT_FILTERS, category: 'diagnostics' });
                scrollToSection('directory');
              }}
              className="hover:text-[#1C1917] hover:underline"
            >
              Diagnostic Labs
            </button>
            <button
              type="button"
              onClick={() => setListBusinessOpen(true)}
              className="font-semibold text-[#B45309] hover:underline"
            >
              List Your Business
            </button>
          </div>
        </div>
      </footer>

      {/* Drawers */}
      <ProviderDetailDrawer
        provider={selectedProvider}
        isSaved={Boolean(
          selectedProvider && session?.savedProviderIds.includes(selectedProvider.id)
        )}
        userName={session?.name}
        onClose={() => setSelectedProviderId(null)}
        onToggleSave={handleToggleSave}
        onCall={handleCallProvider}
        onSubmitCorrection={handleSubmitCorrection}
      />

      <ListBusinessDrawer
        open={listBusinessOpen}
        onClose={() => setListBusinessOpen(false)}
        onCreateProvider={handleCreateProvider}
      />

      <ProfileDrawer
        open={profileOpen}
        session={session}
        providers={providers}
        onClose={() => setProfileOpen(false)}
        onDemoSignIn={handleDemoSignIn}
        onSwitchRole={handleSwitchRole}
        onSignOut={handleSignOut}
        onSelectProvider={(item) => setSelectedProviderId(item.id)}
        onRemoveSaved={handleToggleSave}
        onOpenListBusiness={() => setListBusinessOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#FACC15] bg-[#1C1917] px-4 py-3 text-xs font-semibold text-white shadow-xl sm:text-sm"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FACC15]" aria-hidden="true" />
          <span className="whitespace-nowrap">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
