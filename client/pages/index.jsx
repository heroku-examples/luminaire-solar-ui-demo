import { Link } from 'react-router-dom';
import { HomeCarousel } from '@/components/ui/HomeCarousel';
import { title } from '@/theme.js';
import SunIcon from '../components/icons/SunIcon';

export function getMeta() {
  return {
    title: `${title} - Home`,
  };
}

export default function Index() {
  return (
    <>
      <Hero />
      <CardSection />
      <TestimonialSection />
    </>
  );
}

const Hero = () => {
  const NavButton = ({ children, url }) => {
    return (
      <Link to={url}>
        <button className="rounded-full border-2 py-1.5 px-6">
          {children}
        </button>
      </Link>
    );
  };
  return (
    <div className="w-full relative h-[100vh] flex justify-center items-center">
      <div className="-z-10 absolute top-0 left-0 -mx-4 pt-16 h-[100vh] overflow-hidden">
        <img
          src={'../../assets/img/commercial.jpg'}
          className="object-cover w-[100vw]"
        />
      </div>
      <div className="z-10 w-2/3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
        <h1 className="text-center text-5xl font-bold">
          Leading Provider of Solar Solutions
        </h1>
        <p className="mt-12 text-center">
          {' '}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
          pellentesque sem sed felis rhoncus, sit amet euismod ante viverra.
          Donec tincidunt, diam pellentesque congue dignissim, lorem erat
          dapibus tortor, a pellentesque velit urna non lorem. Quisque a rhoncus
          lorem. Donec id massa id lectus ullamcorper laoreet vitae sed dolor.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <NavButton url="/residential-solutions">
            Residential Solutions
          </NavButton>
          <NavButton url="/commercial-solutions">
            Commercial Solutions
          </NavButton>
        </div>
      </div>
    </div>
  );
};

const CardSection = () => {
  const LeftCard = () => {
    return (
      <div className="col-span-1 flex flex-col justify-center items-center gap-y-6">
        <SunIcon />
        <p className="text-center text-3xl">Monthly Savings</p>
        <p className="text-center text-lg">
          Reduce your power bill and save on insurance.
        </p>
        <button className="rounded-full border-2 py-1.5 px-6">
          Learn More
        </button>
      </div>
    );
  };
  return (
    <div className="w-full grid grid-flow-row grid-cols-2 p-12">
      <LeftCard />
      <LeftCard />
    </div>
  );
};

const TestimonialSection = () => {
  return (
    <div className="w-full flex justify-center items-center py-24">
      <p className="text-5xl text-center">
        SolarTech transformed our energy consumption, <br /> saving us
        thousands!
      </p>
    </div>
  );
};
