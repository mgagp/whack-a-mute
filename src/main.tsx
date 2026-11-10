import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/lilita-one/latin-400.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/nunito/latin-900.css";
import "./ui/theme.css";
import "./ui/app.css";
import { App } from "./ui/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
