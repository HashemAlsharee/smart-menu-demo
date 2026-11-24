"use client";

/**
 * Rich Café & Restaurant Decorative Backdrop on Warm Cream Canvas
 * Uses Teal Green (#165B5C) & Roasted Coffee Brown (#6B4226)
 * for decorative coffee beans, Dallah, café cups, pastry swirls, and restaurant cloches.
 */
export function CafeRestaurantBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Soft warm & teal liquid glowing ambient orbs */}
      <div className="absolute -top-24 -start-24 size-96 rounded-full bg-teal/12 blur-3xl" />
      <div className="absolute top-1/3 -end-28 size-96 rounded-full bg-roast/12 blur-3xl" />
      <div className="absolute -bottom-24 start-1/4 size-96 rounded-full bg-teal/10 blur-3xl" />

      {/* Repeating Coffee Bean + Café + Restaurant SVG Pattern Tile in Teal Green & Roast Brown */}
      <svg className="absolute inset-0 size-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="smart-menu-dining-pattern"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            {/* 1. Roasted Coffee Bean (top-left) - Teal Green */}
            <g transform="translate(28, 32) rotate(-25)" stroke="#165B5C" strokeWidth="1.7" fill="none">
              <ellipse cx="18" cy="12" rx="15" ry="10" />
              <path d="M5 11c7 4 17-4 26 1" strokeLinecap="round" />
            </g>

            {/* 2. Second Coffee Bean cluster (bottom-right) - Roast Brown */}
            <g transform="translate(185, 190) rotate(35)" stroke="#6B4226" strokeWidth="1.6" fill="none">
              <ellipse cx="14" cy="9" rx="12" ry="8" />
              <path d="M4 8c5 3 13-3 20 1" strokeLinecap="round" />
            </g>

            {/* 3. Steaming Café Cup (top-right) - Teal Green */}
            <g transform="translate(148, 26)" stroke="#165B5C" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M8 18h20v9a10 10 0 0 1-20 0v-9Z" />
              <path d="M28 20h4a4 4 0 0 1 0 8h-4" />
              <path d="M4 31h28" />
              <path d="M14 13c0-3 3-3 3-6M21 13c0-3 3-3 3-6" />
            </g>

            {/* 4. Restaurant Cloche / Platter Dome (center) - Teal Green */}
            <g transform="translate(88, 108)" stroke="#165B5C" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M6 26a18 18 0 0 1 36 0Z" />
              <circle cx="24" cy="6" r="2.5" />
              <path d="M2 29h44" />
            </g>

            {/* 5. Crossed Restaurant Fork & Knife (bottom-left) - Roast Brown */}
            <g transform="translate(26, 158)" stroke="#6B4226" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M10 6v10a4 4 0 0 0 4 4v14M10 11h8M18 6v10" />
              <path d="M30 6c4 4 4 12 0 16v12M30 6v16" />
            </g>

            {/* 6. Chimney Cake / Croissant Swirl (middle-right) - Teal Green */}
            <g transform="translate(178, 102) rotate(12)" stroke="#165B5C" strokeWidth="1.5" fill="none" strokeLinecap="round">
              <path d="M12 4c8 0 14 5 14 11s-6 11-14 11S4 22 4 16c0-5 5-8 10-8s8 3 8 7-3 6-7 6" />
            </g>

            {/* Subtle accent dots */}
            <circle cx="115" cy="44" r="1.8" fill="#165B5C" />
            <circle cx="64" cy="92" r="1.5" fill="#6B4226" />
            <circle cx="145" cy="175" r="1.8" fill="#165B5C" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#smart-menu-dining-pattern)" />
      </svg>

      {/* Large Floating Hero Ornaments in Teal Green */}
      <svg
        className="float-slow absolute top-24 -start-10 size-52 text-teal/15 sm:size-64"
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        {/* Traditional Yemeni Dallah Silhouette */}
        <path d="M52 20h16l-3 12h-10l-3-12Z" />
        <path d="M60 12v8" strokeLinecap="round" />
        <path d="M44 32h32c4 14 10 26 10 40 0 14-11 24-26 24S34 86 34 72c0-14 6-26 10-40Z" />
        <path d="M44 42C28 40 18 48 14 60c8-2 16 2 22 10" strokeLinecap="round" />
        <path d="M76 42c12 2 18 12 14 24-3 8-10 12-16 10" strokeLinecap="round" />
      </svg>

      <svg
        className="float-reverse absolute bottom-28 -end-10 size-56 text-teal/15 sm:size-72"
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        {/* Giant Roasted Coffee Bean + Restaurant Cloche */}
        <g transform="translate(18, 22) rotate(-18)">
          <ellipse cx="42" cy="28" rx="34" ry="22" />
          <path d="M12 26c16 10 38-10 60 2" strokeLinecap="round" />
        </g>
        <g transform="translate(24, 68)">
          <path d="M12 34a28 28 0 0 1 56 0Z" />
          <circle cx="40" cy="4" r="3.5" />
          <path d="M4 38h72" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
