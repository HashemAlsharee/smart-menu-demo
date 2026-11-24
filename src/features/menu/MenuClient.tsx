"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CATEGORIES, ITEMS, MENU_GROUPS, PAYMENT_METHODS } from "./data";
import { CURRENCY } from "@/lib/config";
import { addOrder } from "@/lib/orders-store";
import type { CategoryId, Item, MenuGroupId, Order, PaymentMethod } from "@/lib/schemas";
import { Num } from "@/components/Num";
import { CafeRestaurantBackdrop } from "@/components/CafeRestaurantBackdrop";

gsap.registerPlugin(useGSAP);

type Lang = "ar" | "en";

const T = {
  ar: {
    brand: "المنيو الإلكتروني",
    branch: "كافيه ومطعم · خدمة الطاولات",
    table: "طاولة رقم",
    welcomeTitle: "اختر القائمة للبدء",
    welcomeSub: "تصفح أقسام الكافيه والحلويات أو قائمة المطعم للوجبات الساخنة",
    exploreMenu: "استعراض الأقسام",
    sectionsCount: "أقسام",
    itemsCount: "صنف",
    backToMenus: "القوائم الرئيسية",
    backToSections: "أقسام القائمة",
    allGroupItems: "كل أصناف القائمة",
    chooseSectionTitle: "اختر القسم لتصفح الأصناف",
    searchPlaceholder: "ابحث في جميع القوائم (قهوة، عصير، برجر، باستا، بتر تشكن...)",
    clearSearch: "مسح",
    searchResultsTitle: "نتائج البحث المباشر",
    noResults: "لا توجد أصناف مطابقة لبحثك",
    resetFilter: "العودة للقوائم",
    add: "إضافة",
    ingredients: "المكونات والتحضير",
    prepTime: "وقت التحضير",
    minutes: "دقيقة",
    calories: "السعرات",
    kcal: "سعرة",
    serving: "التقديم",
    chooseOption: "اختر الحجم أو الإضافة",
    addToOrder: "إضافة إلى الطلب",
    viewCart: "مراجعة الطلب التجريبي",
    cartTitle: "سلة طلبات الطاولة",
    paymentTitle: "طريقة الدفع المفضلة",
    paymentSub: "اختر الدفع النقدي أو عبر المحافظ الإلكترونية (عرض تجريبي)",
    cashTab: "دفع نقدي",
    walletTab: "محفظة إلكترونية",
    merchantCode: "رقم الحساب التجريبي:",
    copyCode: "نسخ الرقم",
    copied: "تم النسخ",
    walletRefPlaceholder: "رقم عملية التحويل أو آخر ٤ أرقام (اختياري)",
    notePlaceholder: "ملاحظة للمطبخ أو النادل (مثل: سكر خفيف، بدون ثلج...)",
    subtotal: "إجمالي الطلب",
    confirmOrder: "تأكيد وإرسال الطلب التجريبي",
    close: "إغلاق",
    demoBadge: "طلب تجريبي · للعرض فقط",
    sentTitle: "تم استلام طلبك التجريبي بنجاح",
    sentSub:
      "هذا نموذج تجريبي تفاعلي للعرض فقط؛ لم يتم تسجيل طلب حقيقي أو خصم أي مبلغ. في النسخة الفعلية يصل الطلب مباشرة لشاشة المحاسب والمطبخ.",
    paymentChosen: "طريقة الدفع",
    newOrder: "تجربة طلب آخر",
    gridView: "شبكة",
    listView: "صفوف",
    footerPrefix: "نموذج تجريبي من",
  },
  en: {
    brand: "Smart Menu",
    branch: "Café & Restaurant · Table Service",
    table: "Table",
    welcomeTitle: "Choose a Menu to Explore",
    welcomeSub: "Browse Café & Bakery selections or the Restaurant Kitchen menu",
    exploreMenu: "Explore Sections",
    sectionsCount: "Sections",
    itemsCount: "Items",
    backToMenus: "Main Menus",
    backToSections: "Sections",
    allGroupItems: "All Menu Items",
    chooseSectionTitle: "Select a Section",
    searchPlaceholder: "Search across all menus (coffee, juice, burger, pasta...)",
    clearSearch: "Clear",
    searchResultsTitle: "Instant Search Results",
    noResults: "No matching items found",
    resetFilter: "Back to Menus",
    add: "Add",
    ingredients: "Ingredients & Preparation",
    prepTime: "Prep Time",
    minutes: "min",
    calories: "Calories",
    kcal: "kcal",
    serving: "Serving",
    chooseOption: "Select Size or Add-on",
    addToOrder: "Add to Order",
    viewCart: "Review Demo Order",
    cartTitle: "Table Order & Checkout",
    paymentTitle: "Payment Method",
    paymentSub: "Choose cash at table or e-wallet transfer (Demo preview)",
    cashTab: "Cash",
    walletTab: "E-Wallets",
    merchantCode: "Demo Merchant Code:",
    copyCode: "Copy",
    copied: "Copied",
    walletRefPlaceholder: "Transfer reference or last 4 digits (optional)",
    notePlaceholder: "Kitchen or waiter note (e.g., low sugar, extra hot...)",
    subtotal: "Order Total",
    confirmOrder: "Confirm & Submit Demo Order",
    close: "Close",
    demoBadge: "Demo Order · Preview Only",
    sentTitle: "Demo Order Submitted",
    sentSub:
      "This is an interactive public demo — no real order was placed and no payment was charged. In production, orders flow directly to the cashier & kitchen.",
    paymentChosen: "Payment",
    newOrder: "Try Another Demo Order",
    gridView: "Grid",
    listView: "Rows",
    footerPrefix: "Interactive demo by",
  },
};

const LOC = { ar: "ar-YE", en: "en-US" };
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

interface CartEntry {
  qty: number;
  sizeId?: string;
}

export function MenuClient({ table }: { table: number }) {
  const [lang, setLang] = useState<Lang>("ar");

  // 3-Level Hierarchy State:
  // Level 1: selectedGroup === null (Shows 2 cards: Café & Beverages / Kitchen & Dining)
  // Level 2: selectedGroup !== null && selectedCategory === null (Shows visual Section Cards for that menu)
  // Level 3: selectedCategory !== null (or "all-group") (Shows square product cards + category pills)
  const [selectedGroup, setSelectedGroup] = useState<MenuGroupId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all-group" | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, CartEntry>>({});

  // Product Detail Modal state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalSizeId, setModalSizeId] = useState<string | undefined>(undefined);

  // Checkout Cart Sheet state
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState<"cash" | "wallet">("cash");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [walletRef, setWalletRef] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [note, setNote] = useState("");

  // Order Confirmation state
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const t = T[lang];
  const loc = LOC[lang];
  const cur = CURRENCY[lang];

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cartBarRef = useRef<HTMLButtonElement>(null);
  const detailWrapRef = useRef<HTMLDivElement>(null);
  const detailCardRef = useRef<HTMLDivElement>(null);
  const detailBackdropRef = useRef<HTMLDivElement>(null);
  const cartWrapRef = useRef<HTMLDivElement>(null);
  const cartSheetRef = useRef<HTMLDivElement>(null);
  const cartBackdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    return () => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    };
  }, [lang]);

  // Sections belonging to the currently selected Menu Group
  const groupCategories = useMemo(
    () => CATEGORIES.filter((c) => c.menuGroup === selectedGroup),
    [selectedGroup],
  );

  // Products to show when in Level 3 or when searching
  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return ITEMS.filter(
        (item) =>
          item.nameAr.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.subtitleAr.toLowerCase().includes(q) ||
          item.subtitleEn.toLowerCase().includes(q) ||
          item.ingredientsAr.some((ing) => ing.toLowerCase().includes(q)) ||
          item.ingredientsEn.some((ing) => ing.toLowerCase().includes(q)),
      );
    }
    if (!selectedGroup || !selectedCategory) return [];
    if (selectedCategory === "all-group") {
      return ITEMS.filter((i) => i.menuGroup === selectedGroup);
    }
    return ITEMS.filter((i) => i.category === selectedCategory);
  }, [query, selectedGroup, selectedCategory]);

  // Resolve unit price with optional size delta
  const getUnitPrice = (item: Item, sizeId?: string) => {
    if (!sizeId || !item.sizes) return item.price;
    const found = item.sizes.find((s) => s.id === sizeId);
    return item.price + (found?.delta ?? 0);
  };

  // Resolved cart lines
  const lines = useMemo(() => {
    return ITEMS.filter((i) => cart[i.id]?.qty > 0).map((item) => {
      const entry = cart[item.id];
      const unitPrice = getUnitPrice(item, entry.sizeId);
      const sizeObj = item.sizes?.find((s) => s.id === entry.sizeId);
      return {
        item,
        qty: entry.qty,
        sizeId: entry.sizeId,
        sizeLabel: sizeObj ? (lang === "ar" ? sizeObj.labelAr : sizeObj.labelEn) : undefined,
        unitPrice,
      };
    });
  }, [cart, lang]);

  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  // Animate stage transitions whenever hierarchy level or search changes
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const nodes = stageRef.current?.querySelectorAll(".anim-card");
      if (!nodes || !nodes.length) return;
      gsap.fromTo(
        nodes,
        { y: 26, scale: 0.96, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.55,
          stagger: 0.055,
          ease: "expo.out",
          overwrite: "auto",
        },
      );
    },
    { dependencies: [selectedGroup, selectedCategory, query, viewMode], scope: stageRef },
  );

  // Parabolic image flight to cart bar
  const flyToCart = (id: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const src = rootRef.current?.querySelector<HTMLElement>(`[data-card-img="${id}"]`);
    const dst = cartBarRef.current;
    const item = ITEMS.find((i) => i.id === id);
    if (!src || !dst || !item) return;
    const a = src.getBoundingClientRect();
    const b = dst.getBoundingClientRect();
    const ghost = document.createElement("div");
    Object.assign(ghost.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${Math.min(a.width, 92)}px`,
      height: `${Math.min(a.height, 92)}px`,
      zIndex: "90",
      borderRadius: "20px",
      backgroundImage: `url("${encodeURI(item.image)}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      pointerEvents: "none",
      boxShadow: "0 18px 36px rgba(22,91,92,0.35)",
      border: "2px solid #FFFFFF",
    });
    document.body.appendChild(ghost);
    gsap.fromTo(
      ghost,
      { x: a.left + a.width / 2 - 46, y: a.top + a.height / 2 - 46, scale: 1 },
      {
        x: b.left + b.width / 2 - 24,
        y: b.top + b.height / 2 - 24,
        scale: 0.22,
        autoAlpha: 0.25,
        duration: 0.68,
        ease: "power3.inOut",
        onComplete: () => {
          ghost.remove();
          gsap.fromTo(
            dst,
            { scale: 1.04 },
            { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.5)" },
          );
        },
      },
    );
  };

  const changeQty = (id: string, delta: number, sizeId?: string) => {
    setCart((prev) => {
      const curr = prev[id]?.qty ?? 0;
      const nextQty = Math.max(0, curr + delta);
      const next = { ...prev };
      if (nextQty === 0) {
        delete next[id];
      } else {
        next[id] = {
          qty: nextQty,
          sizeId: sizeId ?? prev[id]?.sizeId,
        };
      }
      return next;
    });
  };

  const quickAdd = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    flyToCart(item.id);
    changeQty(item.id, 1, item.sizes?.[0]?.id);
  };

  // Open Product Details Modal
  const openProductDetail = (item: Item) => {
    setSelectedItem(item);
    const existing = cart[item.id];
    setModalQty(existing?.qty ? existing.qty : 1);
    setModalSizeId(existing?.sizeId ?? item.sizes?.[0]?.id);
    requestAnimationFrame(() => {
      if (!detailWrapRef.current || !detailCardRef.current || !detailBackdropRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(detailBackdropRef.current, { autoAlpha: 1 });
        gsap.set(detailCardRef.current, { y: 0, scale: 1, autoAlpha: 1 });
        return;
      }
      gsap.fromTo(detailBackdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(
        detailCardRef.current,
        { y: 64, scale: 0.94, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: "expo.out" },
      );
      gsap.fromTo(
        detailCardRef.current.querySelectorAll(".dt-stagger"),
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.05, delay: 0.08, ease: "power3.out" },
      );
    });
  };

  const closeProductDetail = () => {
    if (!selectedItem) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !detailCardRef.current ||
      !detailBackdropRef.current
    ) {
      setSelectedItem(null);
      return;
    }
    gsap.to(detailBackdropRef.current, { autoAlpha: 0, duration: 0.25 });
    gsap.to(detailCardRef.current, {
      y: 48,
      scale: 0.95,
      autoAlpha: 0,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => setSelectedItem(null),
    });
  };

  const saveModalToCart = () => {
    if (!selectedItem) return;
    const id = selectedItem.id;
    setCart((prev) => ({
      ...prev,
      [id]: { qty: modalQty, sizeId: modalSizeId },
    }));
    closeProductDetail();
    setTimeout(() => flyToCart(id), 120);
  };

  // Open / close Checkout Cart Sheet
  const openCartSheet = () => {
    if (!count) return;
    setCartOpen(true);
    requestAnimationFrame(() => {
      if (!cartBackdropRef.current || !cartSheetRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(cartBackdropRef.current, { autoAlpha: 1 });
        gsap.set(cartSheetRef.current, { yPercent: 0 });
        return;
      }
      gsap.fromTo(cartBackdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(
        cartSheetRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.6, ease: "expo.out" },
      );
    });
  };

  const closeCartSheet = () => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !cartBackdropRef.current ||
      !cartSheetRef.current
    ) {
      setCartOpen(false);
      return;
    }
    gsap.to(cartBackdropRef.current, { autoAlpha: 0, duration: 0.25 });
    gsap.to(cartSheetRef.current, {
      yPercent: 100,
      duration: 0.38,
      ease: "power3.in",
      onComplete: () => setCartOpen(false),
    });
  };

  const handlePaymentTab = (tab: "cash" | "wallet") => {
    setPaymentTab(tab);
    if (tab === "cash") {
      setPaymentMethod("cash");
    } else if (paymentMethod === "cash") {
      setPaymentMethod("jawali");
    }
  };

  const copyAccount = (code: string) => {
    navigator.clipboard?.writeText(code.replace(/-/g, ""));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const submitOrder = () => {
    if (!lines.length) return;
    const order: Order = {
      id: uid(),
      table,
      lines: lines.map((l) => ({
        itemId: l.item.id,
        qty: l.qty,
        sizeId: l.sizeId,
        unitPrice: l.unitPrice,
      })),
      total,
      paymentMethod,
      walletRef: paymentMethod !== "cash" && walletRef.trim() ? walletRef.trim() : undefined,
      note: note.trim() || undefined,
      status: "new",
      createdAt: Date.now(),
    };
    addOrder(order);
    setCartOpen(false);
    setCart({});
    setNote("");
    setWalletRef("");
    setLastOrder(order);
  };

  const selectedPaymentMeta =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) ?? PAYMENT_METHODS[0];
  const currentGroupMeta = MENU_GROUPS.find((g) => g.id === selectedGroup);
  const currentCategoryMeta = CATEGORIES.find((c) => c.id === selectedCategory);
  const isSearching = query.trim().length > 0;

  // Reusable Product Square Card Renderer
  const renderProductCard = (item: Item) => {
    const qty = cart[item.id]?.qty ?? 0;
    const title = lang === "ar" ? item.nameAr : item.nameEn;
    const subtitle = lang === "ar" ? item.subtitleAr : item.subtitleEn;
    const badge = lang === "ar" ? item.badgeAr : item.badgeEn;

    return (
      <article
        key={item.id}
        onClick={() => openProductDetail(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openProductDetail(item);
          }
        }}
        className="anim-card liquid-card group relative flex flex-col overflow-hidden rounded-3xl"
      >
        {/* Square 1:1 Image Frame */}
        <div data-card-img={item.id} className="relative aspect-square w-full overflow-hidden bg-roast/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(item.image)}
            alt={title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

          {/* Top Teal Secondary Badge */}
          {badge && (
            <span className="liquid-pill-active absolute top-2.5 start-2.5 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white">
              {badge}
            </span>
          )}

          {/* Prep Time Chip */}
          <span className="absolute bottom-2.5 start-2.5 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md tnum">
            <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            {item.prepMinutes.toLocaleString(loc)} {t.minutes}
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
          <div>
            <h3 className="line-clamp-1 text-sm font-extrabold text-ink sm:text-base">{title}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{subtitle}</p>
          </div>

          {/* Price + Instant Add / Stepper (Teal secondary accent) */}
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-1">
            <div>
              <span className="text-base font-extrabold text-teal-deep tnum sm:text-lg">
                {item.price.toLocaleString(loc)}
              </span>{" "}
              <span className="text-[11px] font-semibold text-muted">{cur}</span>
            </div>

            {qty > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="liquid-pill-active flex h-9 items-center rounded-xl px-1 text-white"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => changeQty(item.id, -1)}
                  className="grid size-7 place-items-center rounded-lg text-base font-bold transition-transform active:scale-90"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-xs font-extrabold tnum">
                  {qty.toLocaleString(loc)}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    flyToCart(item.id);
                    changeQty(item.id, 1);
                  }}
                  className="grid size-7 place-items-center rounded-lg text-base font-bold text-white transition-transform active:scale-90"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => quickAdd(e, item)}
                aria-label={`${t.add} ${title}`}
                className="liquid-pill-active flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold text-white transition-transform active:scale-95"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                <span>{t.add}</span>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  // Reusable Product Single-Row Card Renderer (List View: 1 product per row)
  const renderProductRow = (item: Item) => {
    const qty = cart[item.id]?.qty ?? 0;
    const title = lang === "ar" ? item.nameAr : item.nameEn;
    const subtitle = lang === "ar" ? item.subtitleAr : item.subtitleEn;
    const badge = lang === "ar" ? item.badgeAr : item.badgeEn;

    return (
      <article
        key={item.id}
        onClick={() => openProductDetail(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openProductDetail(item);
          }
        }}
        className="anim-card liquid-card group relative flex items-center gap-3.5 overflow-hidden rounded-3xl p-2.5 sm:gap-5 sm:p-3.5"
      >
        {/* Thumbnail Image */}
        <div
          data-card-img={item.id}
          className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-roast/10 sm:size-28"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(item.image)}
            alt={title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {badge && (
            <span className="liquid-pill-active absolute top-1.5 start-1.5 rounded-lg px-2 py-0.5 text-[10px] font-bold text-white">
              {badge}
            </span>
          )}
        </div>

        {/* Row Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-extrabold text-ink sm:text-base">{title}</h3>
              <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-teal/10 px-2 py-0.5 text-[11px] font-semibold text-teal-deep tnum">
                <svg className="size-3 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" />
                </svg>
                {item.prepMinutes.toLocaleString(loc)} {t.minutes}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{subtitle}</p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <span className="text-base font-extrabold text-teal-deep tnum sm:text-lg">
                {item.price.toLocaleString(loc)}
              </span>{" "}
              <span className="text-[11px] font-semibold text-muted">{cur}</span>
            </div>

            {qty > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="liquid-pill-active flex h-9 items-center rounded-xl px-1 text-white"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => changeQty(item.id, -1)}
                  className="grid size-7 place-items-center rounded-lg text-base font-bold transition-transform active:scale-90"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-xs font-extrabold tnum">
                  {qty.toLocaleString(loc)}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    flyToCart(item.id);
                    changeQty(item.id, 1);
                  }}
                  className="grid size-7 place-items-center rounded-lg text-base font-bold text-white transition-transform active:scale-90"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => quickAdd(e, item)}
                aria-label={`${t.add} ${title}`}
                className="liquid-pill-active flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white transition-transform active:scale-95"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                <span>{t.add}</span>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  // Header Icon Button for View Mode Toggle + Section Row Card Renderer
  const renderSectionRow = (cat: (typeof CATEGORIES)[number]) => {
    const countInCat = ITEMS.filter((i) => i.category === cat.id).length;
    return (
      <article
        key={cat.id}
        onClick={() => setSelectedCategory(cat.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedCategory(cat.id);
          }
        }}
        className="anim-card liquid-card group relative flex items-center gap-3.5 overflow-hidden rounded-3xl p-2.5 sm:gap-5 sm:p-3.5"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-roast/15 sm:size-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(cat.image)}
            alt={lang === "ar" ? cat.nameAr : cat.nameEn}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold text-ink sm:text-lg">
            {lang === "ar" ? cat.nameAr : cat.nameEn}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {lang === "ar" ? cat.subAr : cat.subEn}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pe-1">
          <span className="liquid-pill-active rounded-xl px-3 py-1.5 text-xs font-extrabold text-white tnum">
            {countInCat.toLocaleString(loc)} {t.itemsCount}
          </span>
          <svg
            className={`size-4 text-teal ${lang === "ar" ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </article>
    );
  };

  return (
    <div
      ref={rootRef}
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (selectedItem) closeProductDetail();
          else if (cartOpen) closeCartSheet();
        }
      }}
      className="relative min-h-dvh text-ink pb-36"
    >
      {/* Animated Coffee Bean, Café & Restaurant Decorative Backdrop in Teal Green & Roast Brown */}
      <CafeRestaurantBackdrop />

      {/* ===== STICKY LIQUID GLASS HEADER ===== */}
      <header className="sticky top-0 z-30 px-3 pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-4">
        <div className="liquid-glass mx-auto max-w-5xl rounded-3xl px-4 py-3">
          {/* Top Brand Row */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedGroup(null);
                setSelectedCategory(null);
                setQuery("");
              }}
              className="flex items-center gap-3 text-start"
            >
              <div
                aria-hidden="true"
                className="liquid-pill-active flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm sm:size-13"
              >
                <svg
                  className="size-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 16a8 8 0 0 1 16 0" />
                  <path d="M2 16h20" />
                  <path d="M12 5v3" />
                  <circle cx="12" cy="4" r="1" fill="currentColor" />
                  <path d="M7 20h10" />
                </svg>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-lg font-extrabold tracking-tight text-ink sm:text-2xl">
                    {t.brand}
                  </h1>
                  <span className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold text-teal-deep">
                    <span className="size-2 rounded-full bg-teal pulse-ring" />
                    {t.table} <strong className="tnum">{table.toLocaleString(loc)}</strong>
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted sm:text-xs">{t.branch}</p>
              </div>
            </button>

            {/* View Mode Icon Button + Language Switcher */}
            <div className="flex items-center gap-2">
              {(selectedGroup !== null || isSearching) && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  aria-label={viewMode === "grid" ? t.listView : t.gridView}
                  title={viewMode === "grid" ? t.listView : t.gridView}
                  className="liquid-pill grid size-10 place-items-center rounded-2xl text-teal-deep transition-all hover:border-teal active:scale-95"
                >
                  {viewMode === "grid" ? (
                    <svg className="size-4.5 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="4" width="18" height="6" rx="1.5" />
                      <rect x="3" y="14" width="18" height="6" rx="1.5" />
                    </svg>
                  ) : (
                    <svg className="size-4.5 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="liquid-pill flex h-10 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-bold text-teal-deep transition-all hover:border-teal"
              >
                <svg className="size-4 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                </svg>
                <span>{lang === "ar" ? "EN" : "عربي"}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3">
            <svg
              className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4.5 text-teal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="liquid-pill h-11 w-full rounded-2xl ps-10 pe-10 text-xs text-ink placeholder:text-muted/75 focus:border-teal focus:outline-none sm:text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t.clearSearch}
                className="absolute inset-y-0 end-2.5 my-auto grid size-7 place-items-center rounded-full bg-teal/12 text-teal-deep hover:bg-teal/20"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Breadcrumb Navigation Bar when inside a Menu Group or Section */}
          {!isSearching && selectedGroup && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-roast/12 pt-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup(null);
                  setSelectedCategory(null);
                }}
                className="liquid-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold text-teal-deep hover:border-teal"
              >
                <svg
                  className={`size-3.5 text-teal ${lang === "ar" ? "" : "rotate-180"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t.backToMenus}</span>
              </button>

              <span className="text-muted/50">/</span>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                  selectedCategory === null
                    ? "liquid-pill-active text-white"
                    : "liquid-pill text-ink hover:text-teal-deep"
                }`}
              >
                {lang === "ar" ? currentGroupMeta?.nameAr : currentGroupMeta?.nameEn}
              </button>

              {selectedCategory && (
                <>
                  <span className="text-muted/50">/</span>
                  <span className="liquid-pill-active rounded-xl px-3 py-1.5 font-bold text-white">
                    {selectedCategory === "all-group"
                      ? t.allGroupItems
                      : lang === "ar"
                        ? currentCategoryMeta?.nameAr
                        : currentCategoryMeta?.nameEn}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ===== MAIN 3-STAGE CONTENT AREA ===== */}
      <main ref={stageRef} className="relative z-10 mx-auto max-w-5xl px-4 pt-5">
        {/* --- CASE A: INSTANT SEARCH RESULTS ACROSS ALL MENUS --- */}
        {isSearching ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                {t.searchResultsTitle} ({visibleItems.length.toLocaleString(loc)})
              </h2>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="liquid-pill h-10 rounded-2xl px-3.5 text-xs font-bold text-teal-deep"
              >
                {t.clearSearch}
              </button>
            </div>
            {visibleItems.length === 0 ? (
              <div className="liquid-glass my-10 rounded-3xl p-10 text-center">
                <p className="text-base font-bold text-ink">{t.noResults}</p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="liquid-pill-active mt-4 rounded-2xl px-6 py-2.5 text-xs font-bold text-white"
                >
                  {t.resetFilter}
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
                {visibleItems.map(renderProductCard)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleItems.map(renderProductRow)}
              </div>
            )}
          </div>
        ) : !selectedGroup ? (
          /* --- STAGE 1: TWO GRAND MENU CARDS (CAFÉ & KITCHEN) --- */
          <div>
            <div className="mb-5 text-center">
              <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                {t.welcomeTitle}
              </h2>
              <p className="mt-1 text-xs text-muted sm:text-sm">{t.welcomeSub}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {MENU_GROUPS.map((grp) => {
                const secCount = CATEGORIES.filter((c) => c.menuGroup === grp.id).length;
                const prodCount = ITEMS.filter((i) => i.menuGroup === grp.id).length;
                return (
                  <article
                    key={grp.id}
                    onClick={() => {
                      setSelectedGroup(grp.id);
                      setSelectedCategory(null);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedGroup(grp.id);
                        setSelectedCategory(null);
                      }
                    }}
                    className="anim-card liquid-card group relative flex flex-col overflow-hidden rounded-[2rem] p-3"
                  >
                    {/* Hero Image inside Liquid Frame */}
                    <div className="relative aspect-16/10 w-full overflow-hidden rounded-3xl bg-roast/15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={encodeURI(grp.image)}
                        alt={lang === "ar" ? grp.nameAr : grp.nameEn}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      <span className="liquid-pill-active absolute top-3.5 start-3.5 rounded-2xl px-3.5 py-1 text-xs font-extrabold text-white">
                        {lang === "ar" ? grp.badgeAr : grp.badgeEn}
                      </span>

                      <div className="absolute bottom-3.5 inset-x-4 flex items-end justify-between gap-2">
                        <div>
                          <h3 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                            {lang === "ar" ? grp.nameAr : grp.nameEn}
                          </h3>
                          <p className="mt-0.5 text-xs font-semibold text-white/85">
                            {lang === "ar" ? grp.tagAr : grp.tagEn}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description & Action Row */}
                    <div className="flex flex-1 flex-col justify-between px-2 pt-4 pb-2">
                      <p className="text-xs leading-relaxed text-muted sm:text-sm">
                        {lang === "ar" ? grp.descAr : grp.descEn}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-roast/12 pt-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-deep tnum">
                          <span className="liquid-pill rounded-xl px-2.5 py-1">
                            {secCount.toLocaleString(loc)} {t.sectionsCount}
                          </span>
                          <span className="liquid-pill rounded-xl px-2.5 py-1">
                            {prodCount.toLocaleString(loc)} {t.itemsCount}
                          </span>
                        </div>

                        <span className="liquid-pill-active inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-extrabold text-white">
                          <span>{t.exploreMenu}</span>
                          <svg
                            className={`size-4 ${lang === "ar" ? "rotate-180" : ""}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                          >
                            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : !selectedCategory ? (
          /* --- STAGE 2: VISUAL CATEGORY / SECTION CARDS INSIDE SELECTED MENU GROUP --- */
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
                  {lang === "ar" ? currentGroupMeta?.nameAr : currentGroupMeta?.nameEn} —{" "}
                  <span className="text-teal">{t.chooseSectionTitle}</span>
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {lang === "ar" ? currentGroupMeta?.tagAr : currentGroupMeta?.tagEn}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory("all-group")}
                className="liquid-pill-active rounded-2xl px-4 py-2 text-xs font-extrabold text-white"
              >
                {t.allGroupItems} (
                {ITEMS.filter((i) => i.menuGroup === selectedGroup).length.toLocaleString(loc)})
              </button>
            </div>

            {/* Square Grid vs Single-Row Section Cards */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5">
                {groupCategories.map((cat) => {
                  const countInCat = ITEMS.filter((i) => i.category === cat.id).length;
                  return (
                    <article
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedCategory(cat.id);
                        }
                      }}
                      className="anim-card liquid-card group relative flex flex-col overflow-hidden rounded-3xl p-2.5"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-roast/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={encodeURI(cat.image)}
                          alt={lang === "ar" ? cat.nameAr : cat.nameEn}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        <span className="liquid-pill-active absolute top-2.5 end-2.5 rounded-xl px-2.5 py-1 text-[11px] font-extrabold text-white tnum">
                          {countInCat.toLocaleString(loc)} {t.itemsCount}
                        </span>

                        <div className="absolute inset-x-3 bottom-3">
                          <h3 className="text-base font-extrabold text-white sm:text-lg">
                            {lang === "ar" ? cat.nameAr : cat.nameEn}
                          </h3>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/80">
                            {lang === "ar" ? cat.subAr : cat.subEn}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groupCategories.map(renderSectionRow)}
              </div>
            )}
          </div>
        ) : (
          /* --- STAGE 3: PRODUCTS (SQUARE GRID OR SINGLE-ROW LIST) + QUICK CATEGORY SWITCHER PILLS --- */
          <div>
            {/* Quick Category Switcher Bar */}
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="liquid-pill flex h-10 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-bold text-teal-deep"
              >
                <svg
                  className={`size-3.5 text-teal ${lang === "ar" ? "" : "rotate-180"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t.backToSections}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory("all-group")}
                className={`h-10 rounded-2xl px-4 text-xs font-extrabold transition-all ${
                  selectedCategory === "all-group"
                    ? "liquid-pill-active text-white"
                    : "liquid-pill text-ink hover:text-teal-deep"
                }`}
              >
                {t.allGroupItems}
              </button>

              {groupCategories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`h-10 rounded-2xl px-4 text-xs font-extrabold transition-all ${
                      active
                        ? "liquid-pill-active text-white"
                        : "liquid-pill text-ink hover:text-teal-deep"
                    }`}
                  >
                    {lang === "ar" ? cat.nameAr : cat.nameEn}
                  </button>
                );
              })}
            </div>

            {/* Product Display: Square Grid vs Single-Row List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
                {visibleItems.map(renderProductCard)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleItems.map(renderProductRow)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== CLICKSOFT DEMO FOOTER ===== */}
      <footer className="relative z-10 mx-auto mt-10 max-w-5xl px-4">
        <div className="liquid-glass flex flex-wrap items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-center text-xs text-muted">
          <span>{t.footerPrefix}</span>
          <a
            href="https://www.clicksoftye.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-extrabold text-teal-deep underline decoration-teal/40 underline-offset-4 transition-colors hover:text-teal"
          >
            ClickSoft
          </a>
        </div>
      </footer>

      {/* ===== FLOATING LIQUID GLASS BOTTOM CART BAR ===== */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          ref={cartBarRef}
          type="button"
          onClick={openCartSheet}
          disabled={!count}
          className={`liquid-glass-strong pointer-events-auto flex w-full items-center justify-between rounded-3xl px-5 py-4 text-ink transition-all duration-500 ${
            count
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-24 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`liquid-pill-active grid size-10 place-items-center rounded-2xl text-sm font-extrabold text-white tnum ${
                count ? "pulse-ring" : ""
              }`}
            >
              {count.toLocaleString(loc)}
            </span>
            <div className="text-start">
              <p className="text-sm font-extrabold text-ink">{t.viewCart}</p>
              <p className="text-[11px] text-muted">
                {t.table} {table.toLocaleString(loc)} · {t.paymentTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-teal-deep tnum">
              <Num value={total} locale={loc} />{" "}
              <span className="text-xs font-semibold text-muted">{cur}</span>
            </span>
            <svg
              className={`size-4 text-teal ${lang === "ar" ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* ===== PRODUCT DETAILS LIQUID GLASS MODAL ===== */}
      {selectedItem && (
        <div
          ref={detailWrapRef}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ar" ? selectedItem.nameAr : selectedItem.nameEn}
        >
          <div
            ref={detailBackdropRef}
            onClick={closeProductDetail}
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
          />
          <div
            ref={detailCardRef}
            className="liquid-glass-strong relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[2.25rem] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink sm:rounded-[2.25rem]"
          >
            {/* Hero Image */}
            <div className="relative aspect-16/11 w-full overflow-hidden bg-roast/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(selectedItem.image)}
                alt={lang === "ar" ? selectedItem.nameAr : selectedItem.nameEn}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

              <button
                type="button"
                onClick={closeProductDetail}
                aria-label={t.close}
                className="liquid-pill absolute top-4 end-4 grid size-10 place-items-center rounded-full text-ink transition-transform active:scale-90"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              {(selectedItem.badgeAr || selectedItem.badgeEn) && (
                <span className="liquid-pill-active absolute bottom-4 start-5 rounded-xl px-3.5 py-1 text-xs font-extrabold text-white">
                  {lang === "ar" ? selectedItem.badgeAr : selectedItem.badgeEn}
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {/* Title & Price */}
              <div className="dt-stagger flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                    {lang === "ar" ? selectedItem.nameAr : selectedItem.nameEn}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-teal">
                    {lang === "ar" ? selectedItem.nameEn : selectedItem.nameAr}
                  </p>
                </div>
                <div className="liquid-pill shrink-0 rounded-2xl px-4 py-2 text-end">
                  <span className="text-xl font-extrabold text-teal-deep tnum">
                    {getUnitPrice(selectedItem, modalSizeId).toLocaleString(loc)}
                  </span>{" "}
                  <span className="text-xs font-semibold text-muted">{cur}</span>
                </div>
              </div>

              {/* Full Description */}
              <p className="dt-stagger mt-3.5 text-sm leading-relaxed text-ink/85">
                {lang === "ar" ? selectedItem.descAr : selectedItem.descEn}
              </p>

              {/* Specs Grid: Prep time, Calories, Serving */}
              <div className="dt-stagger mt-5 grid grid-cols-3 gap-2.5">
                <div className="liquid-pill rounded-2xl p-3 text-center">
                  <p className="text-[11px] text-muted">{t.prepTime}</p>
                  <p className="mt-1 text-sm font-extrabold text-teal-deep tnum">
                    {selectedItem.prepMinutes.toLocaleString(loc)} {t.minutes}
                  </p>
                </div>
                <div className="liquid-pill rounded-2xl p-3 text-center">
                  <p className="text-[11px] text-muted">{t.calories}</p>
                  <p className="mt-1 text-sm font-extrabold text-teal-deep tnum">
                    {selectedItem.calories.toLocaleString(loc)} {t.kcal}
                  </p>
                </div>
                <div className="liquid-pill rounded-2xl p-3 text-center">
                  <p className="text-[11px] text-muted">{t.serving}</p>
                  <p className="mt-1 text-xs font-extrabold text-teal-deep">
                    {lang === "ar" ? selectedItem.servingAr : selectedItem.servingEn}
                  </p>
                </div>
              </div>

              {/* Ingredients Chips */}
              <div className="dt-stagger mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal">
                  {t.ingredients}
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {(lang === "ar"
                    ? selectedItem.ingredientsAr
                    : selectedItem.ingredientsEn
                  ).map((ing) => (
                    <span
                      key={ing}
                      className="liquid-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-ink"
                    >
                      <span className="size-1.5 rounded-full bg-teal" />
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional Size / Add-on selector */}
              {selectedItem.sizes && selectedItem.sizes.length > 0 && (
                <div className="dt-stagger mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal">
                    {t.chooseOption}
                  </h3>
                  <div className="mt-2.5 grid gap-2">
                    {selectedItem.sizes.map((sz) => {
                      const active = modalSizeId === sz.id;
                      return (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => setModalSizeId(sz.id)}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                            active
                              ? "liquid-pill-active text-white"
                              : "liquid-pill text-ink"
                          }`}
                        >
                          <span>{lang === "ar" ? sz.labelAr : sz.labelEn}</span>
                          {sz.delta > 0 && (
                            <span className={`font-extrabold tnum ${active ? "text-white" : "text-teal"}`}>
                              +{sz.delta.toLocaleString(loc)} {cur}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Order CTA */}
              <div className="dt-stagger mt-6 flex items-center gap-3">
                <div className="liquid-pill flex h-13 items-center rounded-2xl px-2">
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="grid size-10 place-items-center rounded-xl text-lg font-bold text-ink active:scale-90"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-base font-extrabold text-teal-deep tnum">
                    {modalQty.toLocaleString(loc)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => q + 1)}
                    className="grid size-10 place-items-center rounded-xl text-lg font-bold text-teal active:scale-90"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={saveModalToCart}
                  className="liquid-pill-active flex h-13 flex-1 items-center justify-between rounded-2xl px-5 text-sm font-extrabold text-white transition-transform active:scale-98"
                >
                  <span>{t.addToOrder}</span>
                  <span className="text-base font-extrabold tnum">
                    {(getUnitPrice(selectedItem, modalSizeId) * modalQty).toLocaleString(loc)}{" "}
                    <span className="text-xs font-normal">{cur}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CART & PAYMENT LIQUID GLASS CHECKOUT SHEET ===== */}
      {cartOpen && (
        <div
          ref={cartWrapRef}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.cartTitle}
        >
          <div
            ref={cartBackdropRef}
            onClick={closeCartSheet}
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
          />
          <div
            ref={cartSheetRef}
            className="liquid-glass-strong relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[2.25rem] px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink sm:rounded-[2.25rem] sm:px-6"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-roast/25 sm:hidden" />

            <div className="flex items-center justify-between border-b border-roast/15 pb-3.5">
              <div>
                <h2 className="text-lg font-extrabold text-ink sm:text-xl">{t.cartTitle}</h2>
                <p className="text-xs text-muted">
                  {t.table} {table.toLocaleString(loc)} · {count.toLocaleString(loc)} {t.itemsCount}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCartSheet}
                className="liquid-pill rounded-xl px-3.5 py-1.5 text-xs font-bold text-teal-deep"
              >
                {t.close}
              </button>
            </div>

            {/* Cart Items List */}
            <ul className="divide-y divide-roast/12">
              {lines.map(({ item, qty, sizeLabel, unitPrice }) => (
                <li key={item.id} className="flex items-center gap-3 py-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={encodeURI(item.image)}
                    alt=""
                    className="size-14 shrink-0 rounded-2xl bg-roast/10 object-cover ring-1 ring-teal/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">
                      {lang === "ar" ? item.nameAr : item.nameEn}
                    </p>
                    {sizeLabel && <p className="text-[11px] font-semibold text-teal">{sizeLabel}</p>}
                    <p className="mt-0.5 text-xs font-bold text-teal-deep tnum">
                      {(unitPrice * qty).toLocaleString(loc)} {cur}
                    </p>
                  </div>
                  <div className="liquid-pill flex h-9 items-center rounded-xl px-1">
                    <button
                      type="button"
                      onClick={() => {
                        changeQty(item.id, -1);
                        if (qty === 1 && lines.length === 1) closeCartSheet();
                      }}
                      className="grid size-7 place-items-center text-base font-bold text-ink"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs font-extrabold text-teal-deep tnum">
                      {qty.toLocaleString(loc)}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, 1)}
                      className="grid size-7 place-items-center text-base font-bold text-teal"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* ===== PAYMENT METHOD SECTION (CASH VS ELECTRONIC WALLETS) ===== */}
            <div className="liquid-glass mt-5 rounded-3xl p-4">
              <div>
                <h3 className="text-sm font-extrabold text-ink">{t.paymentTitle}</h3>
                <p className="text-[11px] text-muted">{t.paymentSub}</p>
              </div>

              {/* Cash vs E-Wallets Switch */}
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-roast/10 p-1">
                <button
                  type="button"
                  onClick={() => handlePaymentTab("cash")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                    paymentTab === "cash"
                      ? "liquid-pill-active text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{t.cashTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentTab("wallet")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                    paymentTab === "wallet"
                      ? "liquid-pill-active text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                    <rect x="14" y="9" width="8" height="6" rx="1.5" />
                  </svg>
                  <span>{t.walletTab}</span>
                </button>
              </div>

              {paymentTab === "cash" ? (
                <div className="liquid-pill mt-3 flex items-center gap-3 rounded-2xl p-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal text-white">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-ink">
                      {lang === "ar" ? PAYMENT_METHODS[0].nameAr : PAYMENT_METHODS[0].nameEn}
                    </p>
                    <p className="text-[11px] text-muted">
                      {lang === "ar" ? PAYMENT_METHODS[0].subAr : PAYMENT_METHODS[0].subEn}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {/* E-Wallet Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PAYMENT_METHODS.filter((m) => m.type === "wallet").map((w) => {
                      const active = paymentMethod === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setPaymentMethod(w.id)}
                          className={`flex flex-col items-start rounded-2xl p-2.5 text-start transition-all ${
                            active ? "liquid-pill-active text-white" : "liquid-pill text-ink"
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="text-xs font-extrabold">
                              {lang === "ar" ? w.nameAr : w.nameEn}
                            </span>
                            {active && <span className="size-2 rounded-full bg-white" />}
                          </div>
                          <span className={`mt-1 text-[10px] tnum ${active ? "text-white/85" : "text-teal"}`}>
                            {w.accountCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Wallet Merchant Number & Reference Input */}
                  {selectedPaymentMeta.accountCode && (
                    <div className="liquid-pill rounded-2xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-muted">{t.merchantCode}</p>
                          <p className="mt-0.5 text-base font-extrabold tracking-wide text-teal-deep tnum">
                            {selectedPaymentMeta.accountCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyAccount(selectedPaymentMeta.accountCode!)}
                          className="liquid-pill-active rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                        >
                          {copiedCode ? t.copied : t.copyCode}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={walletRef}
                        onChange={(e) => setWalletRef(e.target.value)}
                        maxLength={40}
                        placeholder={t.walletRefPlaceholder}
                        className="mt-2.5 h-10 w-full rounded-xl border border-teal/25 bg-white/80 px-3 text-xs text-ink placeholder:text-muted/70 focus:border-teal focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Note */}
            <div className="mt-4">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                placeholder={t.notePlaceholder}
                className="liquid-pill h-11 w-full rounded-2xl px-4 text-xs text-ink placeholder:text-muted/75 focus:border-teal focus:outline-none"
              />
            </div>

            {/* Total & Confirm Button */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">{t.subtotal}</span>
              <span className="text-2xl font-extrabold text-teal-deep tnum">
                <Num value={total} locale={loc} />{" "}
                <span className="text-xs font-semibold text-muted">{cur}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={submitOrder}
              className="liquid-pill-active mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-extrabold text-white transition-transform active:scale-98"
            >
              <span>{t.confirmOrder}</span>
            </button>
          </div>
        </div>
      )}

      {/* ===== ORDER SENT CONFIRMATION LIQUID GLASS MODAL ===== */}
      {lastOrder && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="liquid-glass-strong w-full max-w-md rounded-3xl p-6 text-center text-ink">
            <div className="liquid-pill-active mx-auto grid size-16 place-items-center rounded-2xl text-white">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="liquid-pill mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-teal-deep">
              <span className="size-1.5 rounded-full bg-teal" />
              {t.demoBadge}
            </span>
            <h2 className="mt-3 text-xl font-extrabold text-ink">{t.sentTitle}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.sentSub}</p>

            <div className="liquid-pill mt-5 space-y-2 rounded-2xl p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">{t.table}</span>
                <span className="font-bold text-ink tnum">{lastOrder.table.toLocaleString(loc)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.paymentChosen}</span>
                <span className="font-bold text-teal-deep">
                  {lang === "ar"
                    ? PAYMENT_METHODS.find((m) => m.id === lastOrder.paymentMethod)?.nameAr
                    : PAYMENT_METHODS.find((m) => m.id === lastOrder.paymentMethod)?.nameEn}
                </span>
              </div>
              <div className="flex justify-between border-t border-roast/15 pt-2">
                <span className="text-muted">{t.subtotal}</span>
                <span className="text-sm font-extrabold text-teal-deep tnum">
                  {lastOrder.total.toLocaleString(loc)} {cur}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLastOrder(null)}
              className="liquid-pill-active mt-6 h-12 w-full rounded-2xl text-xs font-extrabold text-white transition-transform active:scale-98"
            >
              {t.newOrder}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
