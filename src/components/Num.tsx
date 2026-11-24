"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Counts smoothly to `value`. Respects reduced motion. */
export function Num({ value, locale }: { value: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const fmt = (n: number) => Math.round(n).toLocaleString(locale);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        shown.current = value; el.textContent = fmt(value); return;
      }
      const o = { v: shown.current };
      gsap.to(o, {
        v: value, duration: 0.6, ease: "power3.out",
        onUpdate: () => { shown.current = o.v; el.textContent = fmt(o.v); },
      });
    },
    { dependencies: [value, locale] },
  );

  return <span ref={ref} className="tnum">{value.toLocaleString(locale)}</span>;
}
