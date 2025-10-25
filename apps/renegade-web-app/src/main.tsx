import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx';
import { ConvexClientProvider } from './components/providers/convex-provider.tsx';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppErrorBoundary>
        <ConvexClientProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConvexClientProvider>
      </AppErrorBoundary>
    </ClerkProvider>
  </StrictMode>
);
