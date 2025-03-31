import { Image } from '@mantine/core';
import architecture from '@/assets/img/kubecon-architecture.gif';

export default function Demo() {
  return (
    <Image
      src={architecture}
      alt="Architecture"
      className="max-w-7xl mx-auto"
    />
  );
}
