import { Suspense } from 'react';
import { Header } from '@/components/ui/Header.jsx';
import { Footer } from '@/components/ui/Footer';
import { ErrorBoundary } from 'react-error-boundary';
import BootstrapMessaging from '@/components/ui/Chat/BootstrapMessaging';

export default function Default({ children }) {
  function fallbackRender({ error, resetErrorBoundary }) {
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    );
  }

  return (
    <Suspense>
      <Header />
      <div className="px-12 bg-lightest-grey">
        <ErrorBoundary
          fallbackRender={fallbackRender}
          onReset={(details) => {
            // log the error to the server
            console.log(details);
          }}
        >
          <div className="mt-16">{children}</div>
        </ErrorBoundary>
      </div>
      <Footer />
      <div className="fixed bottom-8 right-8 drop-shadow-xl z-50">
        <BootstrapMessaging />
      </div>
    </Suspense>
  );
}
