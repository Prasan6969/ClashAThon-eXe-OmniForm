import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./style.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const container = document.querySelector<HTMLDivElement>("#app");

if (container) {
  if (!publishableKey) {
    createRoot(container).render(
      <div style={{ padding: "2rem", fontFamily: "Space Grotesk, sans-serif" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Missing Clerk key</h1>
        <p>
          Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in
          <code>src/omniform-frontend/.env</code>, then restart Vite.
        </p>
      </div>
    );
  } else {
    createRoot(container).render(
      <ClerkProvider publishableKey={publishableKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    );
  }
}
