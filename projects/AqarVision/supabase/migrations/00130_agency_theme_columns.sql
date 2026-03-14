-- M13 Agency theme columns
--
-- Adds storefront customisation fields to the agencies table:
--   theme         → which ThemeManifest ID to use (defaults to 'modern')
--   primary_color → override primary CSS var (hex, e.g. '#1a365d')
--   accent_color  → override accent CSS var
--   secondary_color → override secondary CSS var
--
-- All columns are nullable: NULL means "use manifest default".

alter table public.agencies
  add column if not exists theme text not null default 'modern',
  add column if not exists primary_color text,
  add column if not exists accent_color text,
  add column if not exists secondary_color text;

-- Optional: constrain theme to known values (comment out if you prefer to
-- enforce this at the application layer only)
-- alter table public.agencies
--   add constraint agencies_theme_check
--   check (theme in ('minimal','modern','professional','editorial','premium','luxury','bold'));

comment on column public.agencies.theme is
  'ThemeManifest ID for the public storefront (default: modern)';
comment on column public.agencies.primary_color is
  'Hex override for --agency-primary CSS variable (null = theme default)';
comment on column public.agencies.accent_color is
  'Hex override for --agency-accent CSS variable (null = theme default)';
comment on column public.agencies.secondary_color is
  'Hex override for --agency-secondary CSS variable (null = theme default)';
