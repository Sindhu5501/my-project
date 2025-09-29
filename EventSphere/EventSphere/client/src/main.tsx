import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { inject } from '@vercel/analytics';

// Add analytics if in production environment
if (process.env.NODE_ENV === 'production') {
  inject();
}

createRoot(document.getElementById("root")!).render(<App />);
