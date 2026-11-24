# CURRENT STATE
- Converted to Public White-Label Demo ("المنيو الإلكتروني" / "Smart Menu") for ClickSoft (https://www.clicksoftye.com).
- Active routes: `/` (renders MenuClient directly with default demo Table 3), `/t/[table]` (tables 1..10).
- Removed routes & assets: `/cashier`, `/qr`, `src/features/cashier/CashierClient.tsx`, `src/features/menu/QrClient.tsx`, `public/haraz-logo.png`.
- White-labeled all metadata, schemas (`cafe` / `kitchen`), menu items, generic Unsplash photography, demo wallet account codes (`DEMO-1001`..`DEMO-5005`), inline SVG brand icon, ClickSoft footer, and demo order confirmation modal.
- Orders remain local-only (`localStorage` + `BroadcastChannel`, key `smart_menu_demo_orders`) for public demo purposes.
- Verification: `npm run build` PASS; `npm run typecheck` (`tsc --noEmit`) PASS; leftover branding grep PASS; logical CSS grep PASS; live browser test NOT RUN.
- Ready for free Vercel deployment (zero env vars required).
