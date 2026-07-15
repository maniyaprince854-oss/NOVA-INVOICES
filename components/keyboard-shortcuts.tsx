"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        router.push("/invoices/new");
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.key === "F2") {
        e.preventDefault();
        router.push("/customers/new");
      } else if (e.key === "F3") {
        e.preventDefault();
        router.push("/products/new");
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [router]);

  return null;
}
