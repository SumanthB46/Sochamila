"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Routes that should NOT show the default navbar and footer
  const hideNavbarRoutes = [
    "/admin",
    "/vendor",
    "/login",
    "/register",
    "/editor",
    "/configurator",
  ];

  // Check if current route should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(route + "/")
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main className={shouldHideNavbar ? "" : "min-h-[80vh]"}>
        {children}
      </main>
      {!shouldHideNavbar && <Footer />}
    </>
  );
}
