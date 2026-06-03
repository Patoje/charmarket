ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_phone" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");