import { createContext, useContext, useState } from "react";

const LoaderContext = createContext(undefined);

export const LoaderProvider = ({ children, isPlaying = true }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading, isPlaying }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useLoader must be used within a LoaderProvider");
  return context;
};
