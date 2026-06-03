import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

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
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  language: text("language").notNull(),
  priceUsdMinorista: numeric("price_usd_minorista").notNull(),
  priceUsdMayorista: numeric("price_usd_mayorista").notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
});
