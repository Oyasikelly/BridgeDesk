'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface FocusContextType {
  isWindowFocused: boolean;
  isInitialized: boolean;
  preventRefetch: boolean;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [preventRefetch, setPreventRefetch] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - preventing refetch');
      setIsWindowFocused(true);
      setPreventRefetch(true);

      // Reset prevent refetch after a short delay
      setTimeout(() => {
        setPreventRefetch(false);
      }, 2000);
    };

    const handleBlur = () => {
      console.log('Window blurred');
      setIsWindowFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Mark as initialized after first focus
    if (!isInitialized) {
      setIsInitialized(true);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isInitialized]);

  return (
    <FocusContext.Provider
      value={{
        isWindowFocused,
        isInitialized,
        preventRefetch,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
