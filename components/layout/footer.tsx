import Image from 'next/image';

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="p-12 bg-gray-100 flex justify-end">
        <div className="flex items-center">
          <p className="text-gray-600 italic mr-4">Powered by</p>
          <Image
            src="/heroku-logo.png"
            alt="Heroku"
            width={120}
            height={30}
            className="h-12w-auto"
          />
        </div>
      </div>
    </footer>
  );
}
