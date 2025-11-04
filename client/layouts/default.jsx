import { Suspense } from 'react';
import { Header } from '@/components/ui/Header.jsx';
import { Footer } from '@/components/ui/Footer';
import { ErrorBoundary } from 'react-error-boundary';
import { getChatbotComponent } from '@/components/ui/Chat/helpers/chatbotSwitch';
import { useLocation } from 'react-router-dom';
import { useRouteContext } from '/:core.jsx';

export default function Default({ children }) {
  const ChatbotComponent = getChatbotComponent();
  const location = useLocation();
  const { snapshot } = useRouteContext();

  // Only show chat on dashboard when a system is selected
  const isDashboard = location.pathname === '/dashboard';
  const hasSystemSelected = snapshot?.system?.id != null;
  const showChat = isDashboard && hasSystemSelected;

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
    <div className="h-full flex flex-col">
      <Suspense>
        <Header />
        <div className="px-12 bg-lightest-grey flex-1">
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
        {ChatbotComponent && showChat && <ChatbotComponent />}
      </Suspense>
    </div>
  );
}
