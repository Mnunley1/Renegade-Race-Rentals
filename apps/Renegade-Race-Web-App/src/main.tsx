import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ConvexClientProvider } from "./components/providers/convex-provider";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexClientProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexClientProvider>
    </ClerkProvider>
  </StrictMode>
);
