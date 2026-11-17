import fs from 'fs';
import path from 'path';
import { SEED_PROVIDERS } from '@/data/seedProviders';
import type { CorrectionReport, Provider } from '@/types/provider';

interface StoreState {
  providers: Provider[];
  corrections: CorrectionReport[];
}

declare global {
  var __pawBeaconStore: StoreState | undefined;
}

const STORE_FILE = path.join(process.cwd(), '.next', 'pawbeacon-mvp-store.json');

function loadInitialStore(): StoreState {
  if (globalThis.__pawBeaconStore) {
    return globalThis.__pawBeaconStore;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as StoreState;
      if (Array.isArray(parsed.providers) && parsed.providers.length > 0) {
        globalThis.__pawBeaconStore = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to clean in-memory seed if filesystem is unavailable
  }

  const fresh: StoreState = {
    providers: [...SEED_PROVIDERS],
    corrections: [],
  };
  globalThis.__pawBeaconStore = fresh;
  return fresh;
}

function persistStore(state: StoreState): void {
  globalThis.__pawBeaconStore = state;
  try {
    const dir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Safe no-op in read-only environments
  }
}

export function getServerProviders(): Provider[] {
  return loadInitialStore().providers;
}

export function addServerProvider(provider: Provider): Provider {
  const store = loadInitialStore();
  const next: StoreState = {
    ...store,
    providers: [provider, ...store.providers],
  };
  persistStore(next);
  return provider;
}

export function getServerCorrections(): CorrectionReport[] {
  return loadInitialStore().corrections;
}

export function applyServerCorrection(
  report: CorrectionReport
): { report: CorrectionReport; updatedProvider: Provider | null } {
  const store = loadInitialStore();
  let updatedProvider: Provider | null = null;

  const updatedProviders = store.providers.map((item) => {
    if (item.id !== report.providerId) {
      return item;
    }

    const patched = { ...item };
    if (report.field === 'hours') {
      patched.openHours = report.suggestedValue;
      patched.is24Hours = /24\s*\/\s*7|24\s*hours/i.test(report.suggestedValue);
      patched.isOpenNow = true;
    } else if (report.field === 'phone') {
      patched.phone = report.suggestedValue;
    } else if (report.field === 'address') {
      patched.address = report.suggestedValue;
    } else if (report.field === 'emergency_status') {
      const enabled = /24|yes|open|true|available/i.test(report.suggestedValue);
      patched.is24Hours = enabled;
      if (enabled) {
        patched.openHours = 'Open 24 Hours';
        patched.isOpenNow = true;
      }
    } else if (report.field === 'services') {
      const additions = report.suggestedValue
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      patched.services = Array.from(new Set([...patched.services, ...additions]));
    }

    updatedProvider = patched;
    return patched;
  });

  const next: StoreState = {
    providers: updatedProviders,
    corrections: [report, ...store.corrections],
  };
  persistStore(next);

  return { report, updatedProvider };
}
