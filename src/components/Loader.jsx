import { useEffect, useState } from "react";
import { useLoader } from "../context/LoaderContext";
import "./Loader.css";

const LOAD_DURATION = 500; // ms for the progress counter to go 0 → 100

const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const { isPlaying } = useLoader();

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }
    const step = LOAD_DURATION / 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, step);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return progress;
};

const Loader = () => {
  const progress = useProgress();
  const { isLoading, setIsLoading } = useLoader();
  const [showFinalRing, setShowFinalRing] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress !== 100) return;
    setTimeout(() => {
      setShowFinalRing(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      }, 900);
    }, 200);
  }, [progress, setIsLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="loader-wrapper"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="loader-logo-container">
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
        {showFinalRing && <div className="ring final-ring" />}
        <img src="/images/ts-logo.png" alt="Tim Stearns logo" className="loader-logo" style={{ borderRadius: "50%" }} />
      </div>
    </div>
  );
};

export default Loader;
