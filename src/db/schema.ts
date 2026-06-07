import { pgTable, text, serial, integer, boolean, timestamp, numeric, index, varchar } from "drizzle-orm/pg-core";

export const globalConfigs = pgTable("global_configs", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  contains: text("contains"),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  subCategory: varchar("sub_category", { length: 100 }), // Moderna, Vintage, etc.
  language: varchar("language", { length: 50 }).notNull().default("Español"),
  priceUsdMinorista: numeric("price_usd_minorista", { precision: 10, scale: 2 }).notNull(),
  priceUsdMayorista: numeric("price_usd_mayorista", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sku: text("sku").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  categoryIdIdx: index("category_id_idx").on(table.categoryId),
  isActiveIdx: index("is_active_idx").on(table.isActive),
  languageIdx: index("language_idx").on(table.language),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("customer"),
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected", "paid", "shipped", "cancelled"
  totalUsd: numeric("total_usd", { precision: 10, scale: 2 }).notNull(),
  totalArsSnapshot: numeric("total_ars_snapshot", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceUsdSnapshot: numeric("price_usd_snapshot", { precision: 10, scale: 2 }).notNull(),
});
