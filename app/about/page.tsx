import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/icons/logo';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold mb-6 text-center">
                About Luminaire Solar
              </h1>

              <div className="prose prose-lg max-w-none space-y-6">
                <p className="text-lg text-gray-700">
                  Luminaire Solar is a leading provider of sustainable energy
                  solutions, offering a wide range of services for commercial,
                  residential, and industrial clients. Our mission is to power
                  the future with clean, renewable energy sources, including
                  both solar and wind energy.
                </p>

                <div className="relative w-full h-64 my-8 rounded-lg overflow-hidden">
                  <Image
                    src="/residential.jpg"
                    alt="Solar panels and wind turbines"
                    fill
                    className="object-cover"
                  />
                </div>

                <p className="text-lg text-gray-700">
                  With years of experience in the energy industry, Luminaire
                  Solar is committed to delivering top-quality installations,
                  innovative energy solutions, and unmatched customer service.
                  Whether you're looking to reduce your carbon footprint at
                  home, optimize energy use in your business, or implement
                  large-scale industrial energy projects, Luminaire Solar has
                  the expertise and solutions you need.
                </p>

                <p className="text-lg text-gray-700">
                  Join us in creating a brighter, greener future. Discover how
                  Luminaire Solar can help you harness the power of the sun and
                  wind to meet your energy needs.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To accelerate the world's transition to sustainable energy
                  through innovative solar solutions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-gray-600">
                  A world powered entirely by clean, renewable energy sources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Our Values</h3>
                <p className="text-gray-600">
                  Sustainability, innovation, quality, and exceptional customer
                  service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
