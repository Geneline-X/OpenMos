"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "./sidebar-context";
import { TopNavbar } from "./top-navbar";
import { Sidebar, MobileSidebar } from "./sidebar";
import { AudioPlayerProvider } from "./audio-player-context";
import { FloatingAudioPlayer } from "./floating-audio-player";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AudioPlayerProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <TopNavbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <MobileSidebar />
            <main className="flex-1 overflow-y-auto bg-default-50/50 pb-32">
              <div className="mx-auto max-w-7xl p-4 lg:p-6">
                {children}
              </div>
            </main>
          </div>
          <FloatingAudioPlayer />
        </div>
      </SidebarProvider>
    </AudioPlayerProvider>
  );
}
