// context/ModalContext.tsx
import React, { createContext, useState, useContext } from "react";

interface ModalContextProps {
  triggerAddModal: boolean;
  setTriggerAddModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [triggerAddModal, setTriggerAddModal] = useState(false);

  return (
    <ModalContext.Provider value={{ triggerAddModal, setTriggerAddModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
