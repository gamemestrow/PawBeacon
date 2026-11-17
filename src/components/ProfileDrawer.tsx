'use client';

import { useState, type FormEvent } from 'react';
import {
  Bookmark,
  Building2,
  ChevronRight,
  LogOut,
  Plus,
  UserCheck,
  X,
} from 'lucide-react';
import { CATEGORY_META, type Provider, type UserRole, type UserSession } from '@/types/provider';

interface ProfileDrawerProps {
  open: boolean;
  session: UserSession | null;
  providers: Provider[];
  onClose: () => void;
  onDemoSignIn: (role: UserRole, customName?: string, customEmail?: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onSignOut: () => void;
  onSelectProvider: (provider: Provider) => void;
  onRemoveSaved: (providerId: string) => void;
  onOpenListBusiness: () => void;
}

export function ProfileDrawer({
  open,
  session,
  providers,
  onClose,
  onDemoSignIn,
  onSwitchRole,
  onSignOut,
  onSelectProvider,
  onRemoveSaved,
  onOpenListBusiness,
}: ProfileDrawerProps) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!open) return null;

  const savedProviders = session
    ? providers.filter((p) => session.savedProviderIds.includes(p.id))
    : [];
  const submittedProviders = session
    ? providers.filter((p) => session.submittedProviderIds.includes(p.id))
    : [];

  function handleCustomSignIn(e: FormEvent) {
    e.preventDefault();
    if (!customName.trim()) return;
    onDemoSignIn(
      'pet_parent',
      customName.trim(),
      customEmail.trim() || 'member@pawbeacon.local'
    );
    setCustomName('');
    setCustomEmail('');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-[#1C1917]/45 backdrop-blur-xs sm:items-stretch"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-drawer-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#FFFDF7] shadow-2xl sm:h-full sm:max-h-none sm:max-w-md sm:rounded-t-none sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-[#D6D3D1]" />
        </div>

        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-6 py-5">
          <div>
            <h2 id="profile-drawer-title" className="text-lg font-bold text-[#1C1917]">
              {session ? 'Your PawBeacon Account' : 'Sign In to PawBeacon'}
            </h2>
            <p className="text-xs text-[#57534E]">
              {session
                ? 'Manage saved care providers and community submissions'
                : 'Zero-key instant MVP login—no password or API keys required'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile panel"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E7E5E4] bg-white text-[#57534E] hover:bg-[#FAF6EB] hover:text-[#1C1917]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {!session ? (
            <>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#78716C]">
                  One-Click Demo Access
                </h3>

                <button
                  type="button"
                  onClick={() => onDemoSignIn('pet_parent')}
                  className="flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-[#F59E0B] bg-[#FACC15] px-4 py-3 text-left transition-colors hover:bg-[#F59E0B]"
                >
                  <div>
                    <div className="text-sm font-bold text-[#1C1917]">
                      Continue as Pet Parent
                    </div>
                    <div className="text-xs text-[#292524]">
                      Save clinics, track emergency contacts, submit corrections
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#1C1917]" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onDemoSignIn('provider_partner')}
                  className="flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white px-4 py-3 text-left transition-colors hover:border-[#F59E0B] hover:bg-[#FEFCE8]"
                >
                  <div>
                    <div className="text-sm font-bold text-[#1C1917]">
                      Continue as Clinic or NGO Partner
                    </div>
                    <div className="text-xs text-[#57534E]">
                      List your facility and manage community updates
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#57534E]" aria-hidden="true" />
                </button>
              </div>

              <div className="border-t border-[#E7E5E4] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#78716C]">
                  Or Enter Custom Display Name
                </h3>
                <form onSubmit={handleCustomSignIn} className="mt-3 space-y-3">
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your name (e.g., Maya Patel)"
                    className="min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
                  />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="min-h-[44px] w-full rounded-xl border border-[#D6D3D1] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#F59E0B] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] w-full rounded-xl border border-[#1C1917] bg-[#1C1917] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#292524]"
                  >
                    Start Session
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Signed-In User Summary */}
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FACC15] text-sm font-bold text-[#1C1917]">
                      <UserCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1C1917]">{session.name}</div>
                      <div className="text-xs text-[#57534E]">{session.email}</div>
                    </div>
                  </div>
                </div>

                {/* Role Switch */}
                <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[#FAF6EB] p-1">
                  <button
                    type="button"
                    onClick={() => onSwitchRole('pet_parent')}
                    className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
                      session.role === 'pet_parent'
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Pet Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchRole('provider_partner')}
                    className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
                      session.role === 'provider_partner'
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Care Provider
                  </button>
                </div>
              </div>

              {/* Saved Providers */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#1C1917]">
                    <Bookmark className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                    <span>Saved Care Providers ({savedProviders.length})</span>
                  </h3>
                </div>

                {savedProviders.length === 0 ? (
                  <p className="mt-2 rounded-2xl border border-dashed border-[#D6D3D1] bg-white p-4 text-xs text-[#57534E]">
                    Tap the bookmark button on any clinic, hospital, ambulance, or NGO card to keep
                    quick emergency contacts here.
                  </p>
                ) : (
                  <ul className="mt-2.5 space-y-2">
                    {savedProviders.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E7E5E4] bg-white px-3.5 py-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProvider(item);
                            onClose();
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="truncate text-sm font-semibold text-[#1C1917] hover:text-[#B45309]">
                            {item.name}
                          </div>
                          <div className="font-mono-tabular truncate text-xs text-[#57534E]">
                            {CATEGORY_META[item.category].shortLabel} · {item.phone}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSaved(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-xs text-[#78716C] hover:bg-[#FAF6EB] hover:text-[#1C1917]"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submitted Listings */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#1C1917]">
                    <Building2 className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                    <span>Your Submitted Listings ({submittedProviders.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenListBusiness();
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-[#FACC15] px-2.5 text-xs font-semibold text-[#1C1917] hover:bg-[#F59E0B]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>

                {submittedProviders.length === 0 ? (
                  <p className="mt-2 rounded-2xl border border-dashed border-[#D6D3D1] bg-white p-4 text-xs text-[#57534E]">
                    No new listings submitted in this session yet.
                  </p>
                ) : (
                  <ul className="mt-2.5 space-y-2">
                    {submittedProviders.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[#E7E5E4] bg-white px-3.5 py-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProvider(item);
                            onClose();
                          }}
                          className="block w-full text-left"
                        >
                          <div className="truncate text-sm font-semibold text-[#1C1917]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#57534E]">
                            {CATEGORY_META[item.category].shortLabel} · {item.neighborhood}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {session && (
          <div className="border-t border-[#E7E5E4] bg-white px-6 py-4">
            <button
              type="button"
              onClick={onSignOut}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#E7E5E4] bg-[#FAF6EB] px-4 py-2.5 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F5F5F4]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
