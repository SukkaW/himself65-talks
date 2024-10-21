import "../styles.css";

import { ReactNode, Suspense } from "react";

import { AI } from "../ai/provider";
import { TooltipProvider } from "../components/ui/tooltip";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { ChatSidebar } from "../components/chat-sidebar";

type RootLayoutProps = { children: ReactNode; path: string };

export default async function RootLayout({ children, path }: RootLayoutProps) {
  return (
    <html>
      <head>
        <title>LlamaIndex.TS Example</title>
      </head>
      <body>
        <SidebarProvider>
          <TooltipProvider>
            <AI>
              <div className="h-screen w-full flex">
                <AppSidebar />
                <SidebarInset>
                  <div className="flex flex-col flex-1">
                    <SidebarTrigger />
                    <Suspense>{children}</Suspense>
                  </div>
                </SidebarInset>
                <ChatSidebar />
              </div>
            </AI>
          </TooltipProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  };
};
