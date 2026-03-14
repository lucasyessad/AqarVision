-- Add stripe_customer_id to agencies for Stripe Billing Portal
alter table public.agencies
  add column if not exists stripe_customer_id text;

comment on column public.agencies.stripe_customer_id is
  'Stripe Customer ID (cus_...) — stored after first checkout or portal creation.';
