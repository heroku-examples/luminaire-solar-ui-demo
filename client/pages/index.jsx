import { Link } from 'react-router-dom';
import { HomeCarousel } from '@/components/ui/HomeCarousel';
import { title } from '@/theme.js';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import WrenchIcon from '../components/icons/WrenchIcon';
import PigIcon from '../components/icons/PigIcon';

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
    </>
  );
}

const Hero = () => {
  const NavButton = ({ children, url, className }) => {
    return (
      <Link to={url}>
        <button className={`rounded-full py-2.5 px-[6.5625rem] ${className}`}>
          {children}
        </button>
      </Link>
    );
  };
  return (
    <div className="w-full relative h-[100vh] flex justify-center items-center">
      <div className="-z-10 absolute top-0 left-0 -mx-4 pt-16 h-[100vh] overflow-hidden">
        <img
          src={'../../assets/img/home.jpg'}
          className="object-cover w-[100vw]"
        />
      </div>
      <div className="z-10 w-2/3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
        <h1 className="text-center text-h1 font-bold">
          Leading Provider of Solar Solutions
        </h1>
        <p className="mt-12 text-center text-h4">
          {' '}
          Comprehensive Solar Energy solutions for all your needs.
        </p>
        <div className="flex justify-center mt-12">
          <NavButton url="/products" className="bg-purple-40 font-semibold">
            Shop Products
          </NavButton>
        </div>
      </div>
    </div>
  );
};

const CardSection = () => {
  const Card = ({ data }) => {
    return (
      <div className="col-span-1 flex flex-col justify-between items-center gap-y-6">
        <div>{data.icon}</div>
        <div className="flex flex-col gap-y-6">
          <p className="text-center text-h4 font-semibold">{data.title}</p>
          <p className="text-center text-lg">{data.body}</p>
          <button className="rounded-full border-2 border-purple-40 py-1.5 px-6 mx-auto text-xs font-semibold text-purple-40">
            Learn More
          </button>
        </div>
      </div>
    );
  };
  const cardsData = [
    {
      icon: <LightbulbIcon />,
      title: 'Sustainable Energy',
      body: "A power source that's good for our planet.",
      url: '/',
    },
    {
      icon: <WrenchIcon />,
      title: 'Easy Installation',
      body: 'Work with our professional installers or DIY.',
      url: '/',
    },
    {
      icon: <PigIcon />,
      title: 'Monthly Savings',
      body: 'Reduce your power bill dramatically.',
      url: '/',
    },
  ];
  return (
    <div className="w-full grid grid-flow-col p-12 mt-12">
      {cardsData.map((data) => {
        return <Card data={data} />;
      })}
    </div>
  );
};
