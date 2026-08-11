CREATE TABLE "pricing_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"eur_to_sek_rate" numeric(10, 4) NOT NULL,
	"freight_markup_multiplier" numeric(6, 4) NOT NULL,
	"reseller_markup_multiplier" numeric(6, 4) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "product_cost_inputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_label" text,
	"gms_credit_price_eur" numeric(10, 2) NOT NULL,
	"freight_price_eur" numeric(10, 2) NOT NULL,
	"target_cost_ratio" numeric(6, 4) NOT NULL,
	"pricing_settings_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reseller_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reseller_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"markup_multiplier" numeric(6, 4) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "list_price_sek" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "pricing_settings" ADD CONSTRAINT "pricing_settings_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_cost_inputs" ADD CONSTRAINT "product_cost_inputs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_cost_inputs" ADD CONSTRAINT "product_cost_inputs_pricing_settings_id_pricing_settings_id_fk" FOREIGN KEY ("pricing_settings_id") REFERENCES "public"."pricing_settings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reseller_prices" ADD CONSTRAINT "reseller_prices_reseller_id_resellers_id_fk" FOREIGN KEY ("reseller_id") REFERENCES "public"."resellers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reseller_prices" ADD CONSTRAINT "reseller_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;