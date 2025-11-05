import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lightbulb, Wrench, PiggyBank } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CardSection />
    </>
  );
}

function Hero() {
  return (
    <div className="relative h-screen flex justify-center items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-black/50 to-black/20" />
        <Image
          src="/home.jpg"
          alt="Solar panels"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
          Leading Provider of Solar Solutions
        </h1>
        <p className="text-xl md:text-2xl text-white drop-shadow-lg max-w-2xl mx-auto">
          Comprehensive Solar Energy solutions for all your needs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Shop Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CardSection() {
  const cards = [
    {
      icon: Lightbulb,
      title: 'Save Energy',
      description:
        'Optimize your energy consumption with smart monitoring and AI-powered insights',
    },
    {
      icon: Wrench,
      title: 'Smart Maintenance',
      description:
        'Predictive maintenance alerts keep your system running at peak efficiency',
    },
    {
      icon: PiggyBank,
      title: 'Save Money',
      description:
        'Reduce your energy bills by up to 30% with intelligent energy management',
    },
  ];

  return (
    <div className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">
          Why Choose Luminaire Solar?
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Experience the future of solar energy management with our
          comprehensive platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
