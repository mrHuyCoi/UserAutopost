// contexts/SidebarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarTab = 'components' | 'phones' | 'services' | 'chatbot' | 'channels' | 'settings';

interface SidebarContextType {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('channels');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};