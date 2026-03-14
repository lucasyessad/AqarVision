export interface DomainEvent<
  TType extends string = string,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Unique event ID */
  id: string;
  /** Event type identifier (e.g. "listing.published", "lead.created") */
  type: TType;
  /** ID of the aggregate that produced the event */
  aggregateId: string;
  /** Type of the aggregate (e.g. "listing", "agency") */
  aggregateType: string;
  /** ID of the agency this event belongs to */
  agencyId: string;
  /** ID of the user who triggered the event (null for system events) */
  actorId: string | null;
  /** Event-specific payload */
  payload: TPayload;
  /** ISO 8601 timestamp */
  occurredAt: string;
  /** Schema version for payload migration */
  version: number;
}

export type EmitDomainEvent = <TType extends string>(
  event: Omit<DomainEvent<TType>, "id" | "occurredAt" | "version">
) => Promise<void>;

/** Well-known domain event types */
export type ListingEvent =
  | "listing.created"
  | "listing.updated"
  | "listing.published"
  | "listing.archived"
  | "listing.rejected"
  | "listing.deleted"
  | "listing.price_changed"
  | "listing.status_changed";

export type AgencyEvent =
  | "agency.created"
  | "agency.updated"
  | "agency.member_invited"
  | "agency.member_joined"
  | "agency.member_removed"
  | "agency.member_role_changed";

export type LeadEvent =
  | "lead.created"
  | "lead.contacted"
  | "lead.converted"
  | "lead.archived";

export type BillingEvent =
  | "billing.subscription_created"
  | "billing.subscription_updated"
  | "billing.subscription_canceled"
  | "billing.payment_succeeded"
  | "billing.payment_failed";

export type AiEvent =
  | "ai.job_created"
  | "ai.job_completed"
  | "ai.job_failed";

export type KnownEventType =
  | ListingEvent
  | AgencyEvent
  | LeadEvent
  | BillingEvent
  | AiEvent;
