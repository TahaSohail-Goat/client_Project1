import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "motion/react";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import App from "./App";
import "./styles/tokens.css";
import "./styles/site.css";
import "./styles/responsive.css";
import "./styles/navigation.css";
import "./styles/housing-study.css";
import "./styles/video-hero.css";
import "./styles/cinematic.css";
import "./styles/vision-depth.css";
import "./styles/materials-depth.css";
import "./styles/models-ribbon.css";
import "./styles/approach-spatial.css";
import "./styles/consultation-motion.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LazyMotion features={domAnimation} strict>
        <App />
      </LazyMotion>
    </BrowserRouter>
  </React.StrictMode>,
);
