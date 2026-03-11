-- =============================================================================
-- AqarVision — Agency Verification Fields
-- =============================================================================
-- Adds verification-related columns to the agencies table.
-- =============================================================================

ALTER TABLE agencies ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'submitted', 'verified', 'rejected'));
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS registre_commerce_url TEXT;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS verification_note TEXT;
