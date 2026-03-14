-- M03 Listings Core — Transactional RPC Functions
-- SCD2 price/status changes with optimistic locking

-- ──────────────────────────────────────────────
-- change_listing_price
-- Transactional SCD2 price change with optimistic locking
-- ──────────────────────────────────────────────
create or replace function public.change_listing_price(
  _listing_id uuid,
  _new_price numeric(14,2),
  _changed_by uuid,
  _reason text default null,
  _expected_version integer default null
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  _now timestamptz := now();
  _current_version integer;
  _current_currency text;
begin
  -- Lock the listing row and verify version
  select version, currency
    into _current_version, _current_currency
    from public.listings
   where id = _listing_id
     and deleted_at is null
     for update;

  if not found then
    raise exception 'Listing not found or deleted: %', _listing_id;
  end if;

  if _expected_version is not null and _current_version <> _expected_version then
    raise exception 'Optimistic lock conflict: expected version %, found %',
      _expected_version, _current_version;
  end if;

  -- Close the current price period
  update public.listing_price_versions
     set valid_during = tstzrange(lower(valid_during), _now),
         is_current = false
   where listing_id = _listing_id
     and is_current = true;

  -- Insert new price period (open-ended)
  insert into public.listing_price_versions (listing_id, price, currency, valid_during, is_current, changed_by, reason)
  values (_listing_id, _new_price, _current_currency, tstzrange(_now, null), true, _changed_by, _reason);

  -- Update the listing denormalized price and bump version
  update public.listings
     set current_price = _new_price,
         version = version + 1,
         updated_at = _now
   where id = _listing_id;
end;
$$;

comment on function public.change_listing_price(uuid, numeric, uuid, text, integer) is
  'Atomically changes listing price using SCD2 pattern. Closes current price period, opens new one, bumps version. Supports optimistic locking via _expected_version.';

-- ──────────────────────────────────────────────
-- change_listing_status
-- Transactional SCD2 status change with optimistic locking
-- Sets published_at when status transitions to published
-- ──────────────────────────────────────────────
create or replace function public.change_listing_status(
  _listing_id uuid,
  _new_status public.listing_status,
  _changed_by uuid,
  _reason text default null,
  _expected_version integer default null
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  _now timestamptz := now();
  _current_version integer;
  _current_status public.listing_status;
begin
  -- Lock the listing row and verify version
  select version, current_status
    into _current_version, _current_status
    from public.listings
   where id = _listing_id
     and deleted_at is null
     for update;

  if not found then
    raise exception 'Listing not found or deleted: %', _listing_id;
  end if;

  if _expected_version is not null and _current_version <> _expected_version then
    raise exception 'Optimistic lock conflict: expected version %, found %',
      _expected_version, _current_version;
  end if;

  -- No-op if status unchanged
  if _current_status = _new_status then
    return;
  end if;

  -- Close the current status period
  update public.listing_status_versions
     set valid_during = tstzrange(lower(valid_during), _now),
         is_current = false
   where listing_id = _listing_id
     and is_current = true;

  -- Insert new status period (open-ended)
  insert into public.listing_status_versions (listing_id, status, valid_during, is_current, changed_by, reason)
  values (_listing_id, _new_status, tstzrange(_now, null), true, _changed_by, _reason);

  -- Update the listing denormalized status, bump version, set published_at if publishing
  update public.listings
     set current_status = _new_status,
         version = version + 1,
         updated_at = _now,
         published_at = case
           when _new_status = 'published' then _now
           else published_at
         end
   where id = _listing_id;
end;
$$;

comment on function public.change_listing_status(uuid, public.listing_status, uuid, text, integer) is
  'Atomically changes listing status using SCD2 pattern. Closes current status period, opens new one, bumps version. Sets published_at on first publish. Supports optimistic locking via _expected_version.';
