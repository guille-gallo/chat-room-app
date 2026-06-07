import { createRoot } from "react-dom/client";
import App from "./App";
import "@guille-gallo/auth-kit/dist/index.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
