import { DiscoveryApp } from '@/components/DiscoveryApp';
import { getServerProviders } from '@/lib/mvpServerStore';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const initialProviders = getServerProviders();
  return <DiscoveryApp initialProviders={initialProviders} />;
}
