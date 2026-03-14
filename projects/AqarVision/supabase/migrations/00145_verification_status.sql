-- M14 Agency verification status
--
-- Adds a `verification_status` column to agencies with a check constraint
-- representing the lifecycle of a verification request.
--
-- Values:
--   'none'     → never submitted (default)
--   'pending'  → submitted, under review
--   'verified' → approved
--   'rejected' → denied (agency may re-submit)

alter table public.agencies
  add column if not exists verification_status text not null default 'none'
    check (verification_status in ('none', 'pending', 'verified', 'rejected'));

comment on column public.agencies.verification_status is
  'Lifecycle status of the agency verification request (none | pending | verified | rejected)';
