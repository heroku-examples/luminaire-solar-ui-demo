import { Suspense } from 'react';
import { Header } from '@/components/ui/Header.jsx';
import { ErrorBoundary } from 'react-error-boundary';
import { Container } from '@mantine/core';

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
      <Container fluid>
        <ErrorBoundary
          fallbackRender={fallbackRender}
          onReset={(details) => {
            // log the error to the server
            console.log(details);
          }}
        >
          {children}
        </ErrorBoundary>
      </Container>
    </Suspense>
  );
}
