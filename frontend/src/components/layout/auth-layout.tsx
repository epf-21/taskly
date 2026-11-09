import { useState } from "react";
import { Header, MobileNavigation, Sidebar } from "../ui";
import { Outlet } from "@tanstack/react-router";

export const AuthLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-taskly-background text-taskly-foreground">
      <div className="flex min-h-dvh">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Header onClick={() => setMobileMenuOpen((open) => !open)} />

          <MobileNavigation
            open={mobileMenuOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />

          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
