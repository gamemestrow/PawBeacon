'use client';

import { Bookmark, Clock, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { CATEGORY_META, type Provider } from '@/types/provider';

interface ProviderCardProps {
  provider: Provider;
  isSaved: boolean;
  onSelect: (provider: Provider) => void;
  onToggleSave: (providerId: string) => void;
  onCall: (provider: Provider) => void;
}

export function ProviderCard({
  provider,
  isSaved,
  onSelect,
  onToggleSave,
  onCall,
}: ProviderCardProps) {
  const categoryInfo = CATEGORY_META[provider.category];

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#E7E5E4] bg-white p-5 transition-colors duration-150 hover:border-[#D6D3D1] sm:p-6">
      <div>
        {/* Quiet unboxed metadata kicker */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[#78716C]">
            <span className="truncate text-[#B45309]">{categoryInfo.shortLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{provider.neighborhood}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular shrink-0">{provider.distanceKm.toFixed(1)} km</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(provider.id)}
            aria-label={isSaved ? `Remove ${provider.name} from saved` : `Save ${provider.name}`}
            className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] ${
              isSaved
                ? 'bg-[#FEF08A] text-[#1C1917]'
                : 'text-[#78716C] hover:bg-[#FAF6EB] hover:text-[#1C1917]'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {/* Title & Tagline */}
        <button
          type="button"
          onClick={() => onSelect(provider)}
          className="mt-1 block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
        >
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-[#1C1917] transition-colors group-hover:text-[#B45309]">
            {provider.name}
          </h3>
        </button>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#57534E]">
          {provider.tagline}
        </p>

        {/* Availability, Species & Services */}
        <div className="mt-4 space-y-2 border-t border-[#F5F5F4] pt-4 text-xs text-[#57534E]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#1C1917]">
              <Clock className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
              <span>{provider.openHours}</span>
            </span>
            <span aria-hidden="true" className="text-[#D6D3D1]">
              ·
            </span>
            <span className="font-mono-tabular">
              {provider.is24Hours
                ? `~${provider.waitMinutes}m triage wait`
                : provider.isOpenNow
                ? 'Open now'
                : 'Closed right now'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#57534E]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden="true" />
            <span className="truncate">{provider.address}</span>
          </div>

          <p className="truncate text-[#78716C]">
            <span className="font-medium text-[#44403C]">Care:</span>{' '}
            {provider.services.slice(0, 3).join(' · ')}
            {provider.services.length > 3 ? ` +${provider.services.length - 3} more` : ''}
          </p>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F5F5F4] pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-[#1C1917]">
              <Star className="h-3.5 w-3.5 fill-[#FACC15] text-[#CA8A04]" aria-hidden="true" />
              <span className="font-mono-tabular">{provider.rating.toFixed(1)}</span>
            </span>
            <span className="font-mono-tabular text-[#78716C]">({provider.reviewCount})</span>
            {provider.verified && (
              <span className="inline-flex items-center gap-1 text-[#B45309]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Verified</span>
              </span>
            )}
          </div>
          <div className="font-mono-tabular mt-0.5 truncate text-xs font-medium text-[#57534E]">
            {provider.feeRange} · {provider.species.slice(0, 3).join(', ')}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onCall(provider)}
            aria-label={`Call ${provider.name}`}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E7E5E4] bg-[#FAF6EB] px-3 py-2 text-xs font-semibold text-[#1C1917] whitespace-nowrap transition-colors hover:border-[#F59E0B] hover:bg-[#FEF08A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Call</span>
          </button>
          <button
            type="button"
            onClick={() => onSelect(provider)}
            className="flex min-h-[44px] items-center rounded-xl bg-[#FACC15] px-4 py-2 text-xs font-semibold text-[#1C1917] whitespace-nowrap transition-colors hover:bg-[#F59E0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
