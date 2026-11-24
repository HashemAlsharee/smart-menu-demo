import { z } from "zod";

export const MenuGroupIdSchema = z.enum(["cafe", "kitchen"]);
export type MenuGroupId = z.infer<typeof MenuGroupIdSchema>;

export const CategoryIdSchema = z.enum([
  // Café & Beverages Sections
  "arabic-coffee",
  "specialty-coffee",
  "hot-beverages",
  "cold-beverages",
  "fresh-juices",
  "sweets-chimney",
  // Kitchen & Dining Sections
  "main-meals",
  "appetizers-fries",
  "burgers-sandwiches",
  "pasta-grills",
]);
export type CategoryId = z.infer<typeof CategoryIdSchema>;

export const ItemOptionSchema = z.object({
  id: z.string(),
  labelAr: z.string(),
  labelEn: z.string(),
  delta: z.number().int().default(0),
});
export type ItemOption = z.infer<typeof ItemOptionSchema>;

export const ItemSchema = z.object({
  id: z.string(),
  menuGroup: MenuGroupIdSchema,
  category: CategoryIdSchema,
  nameAr: z.string(),
  nameEn: z.string(),
  subtitleAr: z.string(),
  subtitleEn: z.string(),
  descAr: z.string(),
  descEn: z.string(),
  ingredientsAr: z.array(z.string()),
  ingredientsEn: z.array(z.string()),
  prepMinutes: z.number().int().positive(),
  calories: z.number().int().positive(),
  servingAr: z.string(),
  servingEn: z.string(),
  price: z.number().int().positive(),
  image: z.string(),
  badgeAr: z.string().optional(),
  badgeEn: z.string().optional(),
  sizes: z.array(ItemOptionSchema).optional(),
});
export type Item = z.infer<typeof ItemSchema>;

export const PaymentMethodSchema = z.enum([
  "cash",
  "jawali",
  "jeeb",
  "flousak",
  "kuraimi",
  "onecash",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const OrderLineSchema = z.object({
  itemId: z.string(),
  qty: z.number().int().min(1).max(50),
  sizeId: z.string().optional(),
  unitPrice: z.number().int().positive(),
});
export type OrderLine = z.infer<typeof OrderLineSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  table: z.number().int().min(1),
  lines: z.array(OrderLineSchema).min(1),
  total: z.number().int().nonnegative(),
  paymentMethod: PaymentMethodSchema,
  walletRef: z.string().max(40).optional(),
  note: z.string().max(200).optional(),
  status: z.enum(["new", "preparing", "done"]),
  createdAt: z.number(),
});
export type Order = z.infer<typeof OrderSchema>;
