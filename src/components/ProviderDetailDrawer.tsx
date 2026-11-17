'use client';

import { useState, type FormEvent } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Flag,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import {
  CATEGORY_META,
  type CorrectionField,
  type Provider,
} from '@/types/provider';

interface ProviderDetailDrawerProps {
  provider: Provider | null;
  isSaved: boolean;
  userName?: string;
  onClose: () => void;
  onToggleSave: (providerId: string) => void;
  onCall: (provider: Provider) => void;
  onSubmitCorrection: (payload: {
    providerId: string;
    field: CorrectionField;
    suggestedValue: string;
    notes: string;
    submittedBy: string;
  }) => Promise<void>;
}

export function ProviderDetailDrawer({
  provider,
  isSaved,
  userName,
  onClose,
  onToggleSave,
  onCall,
  onSubmitCorrection,
}: ProviderDetailDrawerProps) {
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [field, setField] = useState<CorrectionField>('hours');
  const [suggestedValue, setSuggestedValue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  if (!provider) return null;

  const categoryInfo = CATEGORY_META[provider.category];

  async function handleCorrectionSubmit(e: FormEvent) {
    e.preventDefault();
    if (!provider) return;
    if (!suggestedValue.trim()) {
      setError('Please enter the updated information.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmitCorrection({
        providerId: provider.id,
        field,
        suggestedValue: suggestedValue.trim(),
        notes: notes.trim(),
        submittedBy: userName || 'Community Member',
      });
      setSuggestedValue('');
      setNotes('');
      setSubmittedNotice(true);
      setShowCorrectionForm(false);
      setTimeout(() => setSubmittedNotice(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit correction.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-[#1C1917]/45 backdrop-blur-xs sm:items-stretch"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-detail-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#FFFDF7] shadow-2xl sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-t-none sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile bottom-sheet grab handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-[#D6D3D1]" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E7E5E4] px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-[#78716C]">
              <span className="text-[#B45309]">{categoryInfo.label}</span>
              <span aria-hidden="true">·</span>
              <span>{provider.neighborhood}</span>
            </div>
            <h2
              id="provider-detail-title"
              className="mt-1 text-xl font-bold tracking-tight text-[#1C1917] sm:text-2xl"
            >
              {provider.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close provider details"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#E7E5E4] bg-white text-[#57534E] transition-colors hover:bg-[#FAF6EB] hover:text-[#1C1917]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {provider.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#FAF6EB]">
              <img
                src={provider.imageUrl}
                alt={provider.name}
                referrerPolicy="no-referrer"
                className="h-48 w-full object-cover"
              />
            </div>
          )}

          {submittedNotice && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#FACC15] bg-[#FEFCE8] px-4 py-3 text-sm font-medium text-[#1C1917]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
              <span>Correction applied to this listing. Thank you for helping pet parents.</span>
            </div>
          )}

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E7E5E4] bg-white p-4 text-sm">
            <div>
              <div className="text-xs text-[#78716C]">Hours & Triage</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-[#1C1917]">
                <Clock className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                <span>{provider.openHours}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#78716C]">Typical Fee</div>
              <div className="font-mono-tabular mt-0.5 font-semibold text-[#1C1917]">
                {provider.feeRange}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#78716C]">Rating</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-[#1C1917]">
                <Star className="h-4 w-4 fill-[#FACC15] text-[#CA8A04]" aria-hidden="true" />
                <span className="font-mono-tabular">
                  {provider.rating.toFixed(1)} ({provider.reviewCount})
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#78716C]">Verification</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-[#1C1917]">
                <ShieldCheck
                  className={`h-4 w-4 ${provider.verified ? 'text-[#B45309]' : 'text-[#78716C]'}`}
                  aria-hidden="true"
                />
                <span>{provider.verified ? 'Verified Listing' : 'Community Submitted'}</span>
              </div>
            </div>
          </div>

          {/* About & Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1C1917]">About This Provider</h3>
            <p className="text-sm leading-relaxed text-[#57534E]">{provider.description}</p>
            <div className="flex items-start gap-2.5 rounded-xl bg-[#FAF6EB] p-3.5 text-sm text-[#1C1917]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
              <div>
                <div className="font-medium">{provider.address}</div>
                <div className="font-mono-tabular text-xs text-[#57534E]">
                  {provider.neighborhood}, {provider.city} · {provider.distanceKm.toFixed(1)} km away
                </div>
              </div>
            </div>
          </div>

          {/* Species & Services */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4">
              <h3 className="text-xs font-semibold text-[#78716C]">Species Treated</h3>
              <p className="mt-2 text-sm font-medium text-[#1C1917]">
                {provider.species.join(' · ')}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4">
              <h3 className="text-xs font-semibold text-[#78716C]">Direct Phone</h3>
              <p className="font-mono-tabular mt-2 text-sm font-semibold text-[#1C1917]">
                {provider.phone}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4">
            <h3 className="text-xs font-semibold text-[#78716C]">Available Services & Care</h3>
            <ul className="mt-2.5 grid grid-cols-1 gap-1.5 text-sm text-[#1C1917] sm:grid-cols-2">
              {provider.services.map((service) => (
                <li key={service} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit a Correction Section */}
          <div className="rounded-2xl border border-[#E7E5E4] bg-[#FAF6EB] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1917]">Notice outdated details?</h3>
                <p className="text-xs text-[#57534E]">
                  Help keep hours, phone numbers, and 24/7 emergency status accurate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCorrectionForm((prev) => !prev);
                  setError('');
                }}
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1917] whitespace-nowrap transition-colors hover:border-[#F59E0B] hover:bg-[#FEFCE8]"
              >
                <Flag className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
                <span>{showCorrectionForm ? 'Cancel' : 'Submit a Correction'}</span>
              </button>
            </div>

            {showCorrectionForm && (
              <form onSubmit={handleCorrectionSubmit} className="mt-4 space-y-3 border-t border-[#E7E5E4] pt-4">
                <div>
                  <label
                    htmlFor="correction-field"
                    className="block text-xs font-semibold text-[#1C1917]"
                  >
                    What needs updating?
                  </label>
                  <select
                    id="correction-field"
                    value={field}
                    onChange={(e) => setField(e.target.value as CorrectionField)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
                  >
                    <option value="hours">Opening Hours</option>
                    <option value="phone">Phone Number</option>
                    <option value="emergency_status">24/7 Emergency Availability</option>
                    <option value="services">Add Missing Service</option>
                    <option value="address">Street Address</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="correction-value"
                    className="block text-xs font-semibold text-[#1C1917]"
                  >
                    Updated Detail
                  </label>
                  <input
                    id="correction-value"
                    type="text"
                    value={suggestedValue}
                    onChange={(e) => setSuggestedValue(e.target.value)}
                    placeholder={
                      field === 'hours'
                        ? 'e.g., 8:00 AM – 10:00 PM'
                        : field === 'phone'
                        ? 'e.g., (512) 555-0190'
                        : field === 'emergency_status'
                        ? 'e.g., 24/7 Emergency Available'
                        : 'Enter updated detail'
                    }
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="correction-notes"
                    className="block text-xs font-semibold text-[#1C1917]"
                  >
                    Notes (optional)
                  </label>
                  <input
                    id="correction-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Verified by phone or recent visit"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>

                {error && <p className="text-xs font-medium text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] w-full rounded-xl bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F59E0B] disabled:opacity-60"
                >
                  {submitting ? 'Applying Update...' : 'Apply Correction'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sticky Footer Action Bar */}
        <div className="flex items-center gap-3 border-t border-[#E7E5E4] bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => onToggleSave(provider.id)}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              isSaved
                ? 'border-[#F59E0B] bg-[#FEFCE8] text-[#1C1917]'
                : 'border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-[#FAF6EB]'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => onCall(provider)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-5 py-2.5 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F59E0B]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>Call {provider.phone}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
