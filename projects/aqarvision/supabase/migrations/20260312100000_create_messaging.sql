-- =============================================================================
-- AqarVision - Messaging System Migration
-- =============================================================================

-- ========== conversations ==========

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
  subject         TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_conversation_status CHECK (status IN ('active', 'archived', 'blocked')),
  CONSTRAINT uq_conversation UNIQUE (agency_id, user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_agency_id ON conversations(agency_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_select'
  ) THEN
    CREATE POLICY conversations_select ON conversations
      FOR SELECT
      USING (
        user_id = auth.uid()
        OR agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_insert'
  ) THEN
    CREATE POLICY conversations_insert ON conversations
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_update'
  ) THEN
    CREATE POLICY conversations_update ON conversations
      FOR UPDATE
      USING (
        user_id = auth.uid()
        OR agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- ========== messages ==========

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_message_content CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_select'
  ) THEN
    CREATE POLICY messages_select ON messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversations c
          WHERE c.id = messages.conversation_id
            AND (
              c.user_id = auth.uid()
              OR c.agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
            )
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_insert'
  ) THEN
    CREATE POLICY messages_insert ON messages
      FOR INSERT
      WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM conversations c
          WHERE c.id = messages.conversation_id
            AND (
              c.user_id = auth.uid()
              OR c.agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
            )
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_update'
  ) THEN
    CREATE POLICY messages_update ON messages
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM conversations c
          WHERE c.id = messages.conversation_id
            AND (
              c.user_id = auth.uid()
              OR c.agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
            )
        )
      );
  END IF;
END $$;

-- ========== trigger: update last_message_at ==========

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation_last_message ON messages;

CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
