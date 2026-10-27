import { useEffect } from "react";
import { useLoader } from "../context/LoaderContext";

// After the loader finishes, scroll to the section named in the URL hash (e.g. /#project).
export default function ScrollToHash() {
  const { isLoading } = useLoader();

  useEffect(() => {
    if (isLoading) return;
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.getElementById(hash.replace("#", ""));
    if (!target) return;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  return null;
}
