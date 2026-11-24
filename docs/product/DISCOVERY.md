# DISCOVERY
Level 1 (Lightweight PEV). Stack approved by user: Next.js + TypeScript + Tailwind + Supabase (realtime), deploy on Vercel.

## Verified Facts (from reference site inspection, partial)
- Brand: Haraz Coffee (حراز كوفي). Site is Joomla; Arabic primary, English link (https://haraaz.coffee/english/) returned 403 Forbidden.
- Two menus: Haraz Coffee (/index.php/menus-haraazcoffee) and Sky Box (/index.php/menus-skybox).
- Sections seen: specialty-coffee, hot-beverages, sweets-section, arabic-coffee (items: صحن تمر, قشر محوج, دلة حراز كبير/صغير, دلة العمادي بالزنجبيل, صحن مكسرات, قهوة صنعاني بالحليب).
- Assets: logo https://www.haraaz.coffee/images/haraazcoffee/logo333.png ; icon .../images/haraazcoffe/logo-haraazcoffee-icon.png ; item photos under /images/menu/CoffeeBeveragesSection/ . Font: Droid Kufi. Candidate colors (unconfirmed role): #106363, #105d5d, #217070 (teal), #fff3c2, #242424.
- Socials: facebook.com/HaraazCoffee, instagram.com/haraaz_coffee, twitter.com/haraazcoffee1, YouTube @haraazcoffee.
- No ordering feature found on the site.

## Gaps (TBD)
- Prices and currency (YER/SAR/USD?), full item list, English names, logo as SVG, contact/location, number of tables, cashier device.
- Inspection was stopped early by the user; data is incomplete. Ask the client for a menu export rather than scraping everything.

## Constraints
RTL/LTR parity with logical CSS (ms-/me-/ps-/pe-/start-/end-), mobile 360px no horizontal overflow, WCAG AA, prefers-reduced-motion.

## MVP In-Scope
Table-bound QR URL (/t/{n}), bilingual menu, cart, send order, cashier realtime dashboard with table number + sound alert.
## Out-of-Scope
Online payment, customer accounts, inventory, delivery, loyalty.
