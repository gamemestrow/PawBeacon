'use client';

import { User } from 'lucide-react';
import type { UserSession } from '@/types/provider';

interface NavbarProps {
  session: UserSession | null;
  onOpenProfile: () => void;
  onOpenListBusiness: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export function Navbar({
  session,
  onOpenProfile,
  onOpenListBusiness,
  onScrollToSection,
}: NavbarProps) {
  const initials = session
    ? session.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7E5E4] bg-[#FFFDF7]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight text-[#1C1917] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FACC15] text-[#1C1917]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <circle cx="8" cy="7.5" r="2.1" />
              <circle cx="16" cy="7.5" r="2.1" />
              <circle cx="5.2" cy="12.5" r="1.8" />
              <circle cx="18.8" cy="12.5" r="1.8" />
              <path d="M12 10.5c-3.1 0-5.4 2.4-5.4 5.2 0 2.1 1.6 3.5 3.6 3.5.8 0 1.3-.3 1.8-.3s1 .3 1.8.3c2 0 3.6-1.4 3.6-3.5 0-2.8-2.3-5.2-5.4-5.2Z" />
            </svg>
          </span>
          <span>PawBeacon</span>
        </a>

        {/* Zone 2: Minimal Text Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 text-sm font-medium text-[#57534E] md:flex"
        >
          <button
            type="button"
            onClick={() => onScrollToSection('directory')}
            className="shrink-0 whitespace-nowrap py-1 transition-colors hover:text-[#1C1917] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
          >
            Find Care
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('services-spotlight')}
            className="shrink-0 whitespace-nowrap py-1 transition-colors hover:text-[#1C1917] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
          >
            Services
          </button>
          <button
            type="button"
            onClick={onOpenListBusiness}
            className="shrink-0 whitespace-nowrap py-1 transition-colors hover:text-[#1C1917] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
          >
            List Business
          </button>
        </nav>

        {/* Zone 3: Single Profile Button for Auth & Account Management */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label={session ? `Open profile for ${session.name}` : 'Sign in or open profile'}
            className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-xl border border-[#E7E5E4] bg-white px-3.5 py-2 text-sm font-semibold text-[#1C1917] whitespace-nowrap transition-colors hover:border-[#F59E0B] hover:bg-[#FEFCE8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
          >
            {session ? (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FACC15] text-xs font-bold text-[#1C1917]">
                  {initials}
                </span>
                <span className="max-w-[110px] truncate">{session.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-[#57534E]" aria-hidden="true" />
                <span>Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
