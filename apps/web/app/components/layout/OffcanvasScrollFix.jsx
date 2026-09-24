"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Bootstrap's offcanvas (used by theme navs for the mobile menu button)
// can leave the page unable to scroll if a route change happens while
// it's open. Generic Bootstrap cleanup, not specific to any one theme —
// lives here, rendered once for every public page, instead of being
// copy-pasted into every theme's Header.
export default function OffcanvasScrollFix() {
  const pathname = usePathname();

  useEffect(() => {
    const fixScroll = () => {
      document.body.style.overflow = "auto";
      document.body.removeAttribute("data-bs-overflow");
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".offcanvas-backdrop").forEach((el) => el.remove());
    };

    document.querySelectorAll(".offcanvas.show").forEach((offcanvas) => {
      offcanvas.classList.remove("show");
      offcanvas.removeAttribute("aria-modal");
      offcanvas.removeAttribute("role");
    });
    fixScroll();

    document.addEventListener("hidden.bs.offcanvas", fixScroll);
    return () => document.removeEventListener("hidden.bs.offcanvas", fixScroll);
  }, [pathname]);

  return null;
}
