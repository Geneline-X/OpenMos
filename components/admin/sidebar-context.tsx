"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  closeMobileSidebar: () => void;
  openMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapsed state

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const collapseSidebar = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expandSidebar = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        toggleSidebar,
        collapseSidebar,
        expandSidebar,
        closeMobileSidebar,
        openMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
