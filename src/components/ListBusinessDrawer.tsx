'use client';

import { useState, type FormEvent } from 'react';
import { Building2, X } from 'lucide-react';
import {
  CATEGORY_META,
  type CareCategory,
  type Provider,
  type SpeciesType,
} from '@/types/provider';

interface ListBusinessDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreateProvider: (
    payload: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'verified' | 'waitMinutes' | 'createdAt'>
  ) => Promise<void>;
}

const ALL_SPECIES: SpeciesType[] = ['Dogs', 'Cats', 'Birds', 'Exotics', 'Livestock'];

export function ListBusinessDrawer({
  open,
  onClose,
  onCreateProvider,
}: ListBusinessDrawerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CareCategory>('clinic');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [is24Hours, setIs24Hours] = useState(false);
  const [openHours, setOpenHours] = useState('8:30 AM – 7:30 PM');
  const [species, setSpecies] = useState<SpeciesType[]>(['Dogs', 'Cats']);
  const [servicesText, setServicesText] = useState('Consultations, Vaccinations, Urgent Triage');
  const [feeRange, setFeeRange] = useState('$45–$75 consult');
  const [tagline, setTagline] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function toggleSpecies(item: SpeciesType) {
    setSpecies((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) {
      setError('Please enter business name, street address, and phone number.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const parsedServices = servicesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onCreateProvider({
        name: name.trim(),
        category,
        tagline:
          tagline.trim() ||
          `${CATEGORY_META[category].shortLabel} offering attentive local animal care`,
        description: `${name.trim()} is a community-listed ${CATEGORY_META[
          category
        ].label.toLowerCase()} serving ${neighborhood.trim() || 'the local area'}.`,
        address: address.trim(),
        neighborhood: neighborhood.trim() || 'Central District',
        city: 'Austin',
        distanceKm: 1.4,
        phone: phone.trim(),
        is24Hours,
        openHours: is24Hours ? 'Open 24 Hours' : openHours.trim() || '9:00 AM – 6:00 PM',
        isOpenNow: true,
        species: species.length > 0 ? species : ['Dogs', 'Cats'],
        services:
          parsedServices.length > 0 ? parsedServices : ['General Care', 'Walk-In Assessment'],
        feeRange:
          feeRange.trim() || (category === 'ngo' ? 'Free / Donation' : '$45–$75 consult'),
      });

      setName('');
      setNeighborhood('');
      setAddress('');
      setPhone('');
      setTagline('');
      setIs24Hours(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save listing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-[#1C1917]/45 backdrop-blur-xs sm:items-stretch"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-business-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#FFFDF7] shadow-2xl sm:h-full sm:max-h-none sm:max-w-lg sm:rounded-t-none sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-[#D6D3D1]" />
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-[#E7E5E4] px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B45309]">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>Provider Onboarding</span>
            </div>
            <h2
              id="list-business-title"
              className="mt-1 text-xl font-bold tracking-tight text-[#1C1917]"
            >
              List Your Animal-Care Business
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close listing form"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E7E5E4] bg-white text-[#57534E] hover:bg-[#FAF6EB] hover:text-[#1C1917]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="biz-name" className="block text-xs font-semibold text-[#1C1917]">
              Clinic, Hospital, Boarding, or NGO Name *
            </label>
            <input
              id="biz-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sunny Paws Veterinary Clinic"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="biz-category" className="block text-xs font-semibold text-[#1C1917]">
                Care Category *
              </label>
              <select
                id="biz-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CareCategory)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              >
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="biz-phone" className="block text-xs font-semibold text-[#1C1917]">
                Phone / Dispatch Number *
              </label>
              <input
                id="biz-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0190"
                className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="biz-address" className="block text-xs font-semibold text-[#1C1917]">
                Street Address *
              </label>
              <input
                id="biz-address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="418 Oakwood Ave"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="biz-neighborhood"
                className="block text-xs font-semibold text-[#1C1917]"
              >
                Neighborhood
              </label>
              <input
                id="biz-neighborhood"
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g., Zilker, Eastside"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4">
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#1C1917]">24/7 Emergency Support</div>
                <div className="text-xs text-[#57534E]">
                  Enable if trauma care, rescue, or dispatch operates round the clock
                </div>
              </div>
              <input
                type="checkbox"
                checked={is24Hours}
                onChange={(e) => setIs24Hours(e.target.checked)}
                className="h-5 w-5 accent-[#F59E0B]"
              />
            </label>

            {!is24Hours && (
              <div className="mt-3 border-t border-[#F5F5F4] pt-3">
                <label htmlFor="biz-hours" className="block text-xs font-semibold text-[#1C1917]">
                  Regular Operating Hours
                </label>
                <input
                  id="biz-hours"
                  type="text"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-[#FFFDF7] px-3 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1C1917]">Species Treated</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_SPECIES.map((item) => {
                const active = species.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSpecies(item)}
                    className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-[#F59E0B] bg-[#FEF08A] text-[#1C1917]'
                        : 'border-[#E7E5E4] bg-white text-[#57534E] hover:bg-[#FAF6EB]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="biz-fee" className="block text-xs font-semibold text-[#1C1917]">
                Consultation / Fee Guide
              </label>
              <input
                id="biz-fee"
                type="text"
                value={feeRange}
                onChange={(e) => setFeeRange(e.target.value)}
                placeholder="$45–$75 consult"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="biz-tagline" className="block text-xs font-semibold text-[#1C1917]">
                Short Summary
              </label>
              <input
                id="biz-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Fear-free clinic & dental care"
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="biz-services" className="block text-xs font-semibold text-[#1C1917]">
              Key Services (comma-separated)
            </label>
            <input
              id="biz-services"
              type="text"
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-700">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[48px] w-full rounded-xl bg-[#FACC15] px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F59E0B] disabled:opacity-60"
            >
              {submitting ? 'Publishing Listing...' : 'Publish to Live Directory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
