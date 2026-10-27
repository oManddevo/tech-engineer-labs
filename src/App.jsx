import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { LoaderProvider } from "./context/LoaderContext";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import ScrollToHash from "./components/ScrollToHash";
import VisitorTracker from "./components/VisitorTracker";
import Hero from "./components/Hero";
import About from "./components/About";
import Technology from "./components/Technology";
import Work from "./components/Work";
import Feedback from "./components/Feedback";
import Footer from "./components/Footer";

// Content editor, only bundled in development (it saves through the dev server, see vite.config.js).
const Editor = import.meta.env.DEV ? lazy(() => import("./editor/Editor")) : null;

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Technology />
      <Work />
      <Feedback />
      <Footer />
    </>
  );
}

function AppContent() {
  return (
    <main className="bg-transparent min-h-screen text-sky-50 selection:bg-sky-400/30">
      <ScrollToHash />
      <VisitorTracker />
      <Loader />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />
        <Route path="/portfolio" element={<Navigate to="/#project" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {Editor && (
          <Route
            path="/edit"
            element={
              <Suspense fallback={null}>
                <Editor />
              </Suspense>
            }
          />
        )}
        <Route
          path="*"
          element={
            <LoaderProvider>
              <AppContent />
              <Analytics />
            </LoaderProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
