import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SpinnerContextType {
  showSpinner: (message?: string) => void;
  hideSpinner: () => void;
  isVisible: boolean;
  message: string;
}

const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined);

interface SpinnerProviderProps {
  children: ReactNode;
}

export const SpinnerProvider: React.FC<SpinnerProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showSpinner = (spinnerMessage?: string) => {
    setMessage(spinnerMessage || '');
    setIsVisible(true);
  };

  const hideSpinner = () => {
    setIsVisible(false);
    setMessage('');
  };

  return (
    <SpinnerContext.Provider value={{ showSpinner, hideSpinner, isVisible, message }}>
      {children}
    </SpinnerContext.Provider>
  );
};

export const useSpinner = (): SpinnerContextType => {
  const context = useContext(SpinnerContext);
  if (!context) {
    throw new Error('useSpinner must be used within a SpinnerProvider');
  }
  return context;
};
