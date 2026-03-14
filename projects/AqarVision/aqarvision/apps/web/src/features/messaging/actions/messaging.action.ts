"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateLeadSchema, SendMessageSchema, MarkReadSchema } from "../schemas/messaging.schema";
import {
  createLead,
  sendMessage,
  markRead,
  getConversationParticipants,
} from "../services/messaging.service";
import type { ActionResult } from "../types/messaging.types";

export async function createLeadAction(
  _prevState: ActionResult<{ lead_id: string; conversation_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ lead_id: string; conversation_id: string }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    message: formData.get("message") || undefined,
    source: formData.get("source") || "platform",
  };

  const parsed = CreateLeadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  try {
    const result = await createLead(
      supabase,
      user.id,
      parsed.data.listing_id,
      parsed.data.message,
      parsed.data.source
    );
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "CREATE_LEAD_FAILED",
        message: err instanceof Error ? err.message : "Failed to create lead",
      },
    };
  }
}

export async function sendMessageAction(
  _prevState: ActionResult<{ message_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ message_id: string }>> {
  const raw = {
    conversation_id: formData.get("conversation_id"),
    body: formData.get("body"),
  };

  const parsed = SendMessageSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  // Check participant access
  const participants = await getConversationParticipants(
    supabase,
    parsed.data.conversation_id
  );

  if (!participants) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Conversation not found" },
    };
  }

  // Check if user is the sender or an agency member
  if (participants.sender_user_id !== user.id) {
    const { data: membership } = await supabase
      .from("agency_memberships")
      .select("id")
      .eq("agency_id", participants.agency_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Not a participant" },
      };
    }
  }

  try {
    const result = await sendMessage(
      supabase,
      user.id,
      parsed.data.conversation_id,
      parsed.data.body
    );
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SEND_FAILED",
        message: err instanceof Error ? err.message : "Failed to send message",
      },
    };
  }
}

export async function markReadAction(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    conversation_id: formData.get("conversation_id"),
  };

  const parsed = MarkReadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  try {
    await markRead(supabase, user.id, parsed.data.conversation_id);
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "MARK_READ_FAILED",
        message:
          err instanceof Error ? err.message : "Failed to mark as read",
      },
    };
  }
}
