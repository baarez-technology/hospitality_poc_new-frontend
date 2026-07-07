import { createContext, useContext, useState, ReactNode } from 'react';

interface GuestAIContextType {
  isOpen: boolean;
  openAI: () => void;
  closeAI: () => void;
  toggleAI: () => void;
}

const GuestAIContext = createContext<GuestAIContextType | undefined>(undefined);

export function GuestAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAI = () => setIsOpen(true);
  const closeAI = () => setIsOpen(false);
  const toggleAI = () => setIsOpen((prev) => !prev);

  return (
    <GuestAIContext.Provider value={{ isOpen, openAI, closeAI, toggleAI }}>
      {children}
    </GuestAIContext.Provider>
  );
}

export function useGuestAI() {
  const context = useContext(GuestAIContext);
  if (context === undefined) {
    throw new Error('useGuestAI must be used within a GuestAIProvider');
  }
  return context;
}

