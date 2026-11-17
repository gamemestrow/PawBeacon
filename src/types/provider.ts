export type CareCategory =
  | 'clinic'
  | 'hospital'
  | 'boarding'
  | 'diagnostics'
  | 'ambulance'
  | 'ngo';

export type SpeciesType = 'Dogs' | 'Cats' | 'Birds' | 'Exotics' | 'Livestock';

export type SortOption = 'relevance' | 'nearest' | 'rating' | 'wait';

export interface Provider {
  id: string;
  name: string;
  category: CareCategory;
  tagline: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  distanceKm: number;
  phone: string;
  is24Hours: boolean;
  openHours: string;
  isOpenNow: boolean;
  species: SpeciesType[];
  services: string[];
  feeRange: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  waitMinutes: number;
  imageUrl?: string;
  createdAt: string;
}

export type CorrectionField =
  | 'hours'
  | 'phone'
  | 'emergency_status'
  | 'services'
  | 'address';

export interface CorrectionReport {
  id: string;
  providerId: string;
  field: CorrectionField;
  suggestedValue: string;
  notes: string;
  submittedBy: string;
  status: 'applied_mvp' | 'pending';
  createdAt: string;
}

export type UserRole = 'pet_parent' | 'provider_partner';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  savedProviderIds: string[];
  submittedProviderIds: string[];
}

export interface DirectoryFilters {
  query: string;
  location: string;
  category: CareCategory | 'all';
  onlyOpenNow: boolean;
  only24Hours: boolean;
  species: SpeciesType | 'all';
  sortBy: SortOption;
}

export const CATEGORY_META: Record<
  CareCategory,
  { label: string; shortLabel: string; description: string }
> = {
  clinic: {
    label: 'Veterinary Clinics',
    shortLabel: 'Vet Clinics',
    description: 'Primary checkups, vaccines, dentistry, and general surgery.',
  },
  hospital: {
    label: '24/7 Animal Hospitals',
    shortLabel: '24/7 Hospitals',
    description: 'Round-the-clock ICU trauma care, oxygen therapy, and triage.',
  },
  boarding: {
    label: 'Boarding Facilities',
    shortLabel: 'Boarding',
    description: 'Climate-controlled suites, medical boarding, and supervised play.',
  },
  diagnostics: {
    label: 'Diagnostics & Labs',
    shortLabel: 'Diagnostics',
    description: 'Digital X-ray, ultrasound, hematology, and rapid PCR panels.',
  },
  ambulance: {
    label: 'Pet Ambulances',
    shortLabel: 'Ambulances',
    description: 'Oxygen-equipped emergency transport with trained vet techs.',
  },
  ngo: {
    label: 'Animal NGOs & Shelters',
    shortLabel: 'NGOs & Shelters',
    description: 'Stray rescue, low-cost sterilization, adoption, and wildlife aid.',
  },
};
