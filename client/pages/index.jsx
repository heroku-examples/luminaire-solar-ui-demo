import { HomeCarousel } from '@/components/ui/HomeCarousel';
import { title } from '@/theme.js';

export function getMeta() {
  return {
    title: `${title} - Home`,
  };
}

export default function Index() {
  return <HomeCarousel />;
}
