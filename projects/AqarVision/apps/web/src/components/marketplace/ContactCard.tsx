"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, MessageCircle, Calendar, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VerificationBadge } from "@/components/ui/VerificationBadge";

export interface ContactCardProps {
  agencyName: string;
  agencySlug: string;
  agentName?: string;
  agentAvatar?: string;
  verificationLevel: 1 | 2 | 3 | 4;
  phone: string;
  whatsappPhone?: string;
  listingTitle: string;
  buttonOrder?: string[];
  onSendMessage: (data: {
    name: string;
    phone: string;
    message: string;
  }) => void;
  onRequestVisit: (data: {
    name: string;
    phone: string;
    date: string;
    timeSlot: string;
  }) => void;
  className?: string;
}

type ActiveForm = "message" | "visit" | null;

export function ContactCard({
  agencyName,
  agencySlug,
  agentName,
  agentAvatar,
  verificationLevel,
  phone,
  whatsappPhone,
  listingTitle,
  buttonOrder = ["call", "whatsapp", "message", "visit"],
  onSendMessage,
  onRequestVisit,
  className,
}: ContactCardProps) {
  const t = useTranslations("contact");
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  // Message form state
  const [msgName, setMsgName] = useState("");
  const [msgPhone, setMsgPhone] = useState("");
  const [msgText, setMsgText] = useState("");

  // Visit form state
  const [visitName, setVisitName] = useState("");
  const [visitPhone, setVisitPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState("morning");

  function handleSendMessage() {
    onSendMessage({ name: msgName, phone: msgPhone, message: msgText });
    setActiveForm(null);
    setMsgName("");
    setMsgPhone("");
    setMsgText("");
  }

  function handleRequestVisit() {
    onRequestVisit({
      name: visitName,
      phone: visitPhone,
      date: visitDate,
      timeSlot: visitSlot,
    });
    setActiveForm(null);
    setVisitName("");
    setVisitPhone("");
    setVisitDate("");
    setVisitSlot("morning");
  }

  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`${t("whatsappMessage")} ${listingTitle}`)}`
    : null;

  const buttons: Record<string, React.ReactNode> = {
    call: (
      <a
        key="call"
        href={`tel:${phone}`}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3",
          "bg-amber-400 dark:bg-amber-500 text-stone-950 dark:text-stone-950",
          "font-semibold text-sm",
          "transition-colors duration-fast",
          "hover:bg-amber-500 dark:hover:bg-amber-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900"
        )}
      >
        <Phone size={18} aria-hidden="true" />
        {t("call")}
      </a>
    ),
    whatsapp: whatsappUrl ? (
      <a
        key="whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
          "bg-green-600 dark:bg-green-600 text-white",
          "font-medium text-sm",
          "transition-colors duration-fast",
          "hover:bg-green-700 dark:hover:bg-green-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900"
        )}
      >
        <MessageCircle size={18} aria-hidden="true" />
        WhatsApp
      </a>
    ) : null,
    message: (
      <button
        key="message"
        type="button"
        onClick={() =>
          setActiveForm(activeForm === "message" ? null : "message")
        }
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
          "border border-teal-600 dark:border-teal-500",
          "text-teal-600 dark:text-teal-400",
          "font-medium text-sm",
          "transition-colors duration-fast",
          "hover:bg-teal-50 dark:hover:bg-teal-950",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900"
        )}
      >
        <MessageCircle size={18} aria-hidden="true" />
        {t("sendMessage")}
      </button>
    ),
    visit: (
      <button
        key="visit"
        type="button"
        onClick={() =>
          setActiveForm(activeForm === "visit" ? null : "visit")
        }
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
          "border border-stone-300 dark:border-stone-600",
          "text-stone-700 dark:text-stone-300",
          "font-medium text-sm",
          "transition-colors duration-fast",
          "hover:bg-stone-50 dark:hover:bg-stone-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900"
        )}
      >
        <Calendar size={18} aria-hidden="true" />
        {t("requestVisit")}
      </button>
    ),
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200 dark:border-stone-800",
        "bg-white dark:bg-stone-900 p-5",
        "shadow-card",
        className
      )}
    >
      {/* Agent / Agency info */}
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          {agentAvatar ? (
            <Image
              src={agentAvatar}
              alt={agentName ?? agencyName}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400 dark:text-stone-500">
              <User size={24} aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {agentName && (
            <p className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">
              {agentName}
            </p>
          )}
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
            {agencyName}
          </p>
          <VerificationBadge level={verificationLevel} size="sm" className="mt-1" />
        </div>
      </div>

      {/* Link to agency listings */}
      <Link
        href={`/search?agency=${agencySlug}`}
        className="mt-3 block text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-fast"
      >
        {t("viewAllListings")}
      </Link>

      {/* Action buttons */}
      <div className="mt-4 flex flex-col gap-2">
        {buttonOrder
          .map((key) => buttons[key])
          .filter(Boolean)}
      </div>

      {/* Message form */}
      {activeForm === "message" && (
        <form
          className="mt-4 flex flex-col gap-3 animate-slide-up"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            label={t("formName")}
            value={msgName}
            onChange={(e) => setMsgName(e.target.value)}
            required
          />
          <Input
            label={t("formPhone")}
            type="tel"
            value={msgPhone}
            onChange={(e) => setMsgPhone(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {t("formMessage")}
            </label>
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              required
              rows={3}
              className={cn(
                "w-full rounded-md border border-stone-300 dark:border-stone-600",
                "bg-white dark:bg-stone-950 px-3 py-2",
                "text-sm text-stone-900 dark:text-stone-100",
                "placeholder:text-stone-400 dark:placeholder:text-stone-500",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950",
                "resize-none"
              )}
            />
          </div>
          <Button variant="primary" type="submit" size="md">
            {t("send")}
          </Button>
        </form>
      )}

      {/* Visit form */}
      {activeForm === "visit" && (
        <form
          className="mt-4 flex flex-col gap-3 animate-slide-up"
          onSubmit={(e) => {
            e.preventDefault();
            handleRequestVisit();
          }}
        >
          <Input
            label={t("formName")}
            value={visitName}
            onChange={(e) => setVisitName(e.target.value)}
            required
          />
          <Input
            label={t("formPhone")}
            type="tel"
            value={visitPhone}
            onChange={(e) => setVisitPhone(e.target.value)}
            required
          />
          <Input
            label={t("formDate")}
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {t("formTimeSlot")}
            </label>
            <select
              value={visitSlot}
              onChange={(e) => setVisitSlot(e.target.value)}
              className={cn(
                "flex h-10 w-full appearance-none rounded-md border",
                "border-stone-300 dark:border-stone-600",
                "bg-white dark:bg-stone-950 px-3 py-2",
                "text-sm text-stone-900 dark:text-stone-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950"
              )}
            >
              <option value="morning">{t("morning")}</option>
              <option value="afternoon">{t("afternoon")}</option>
              <option value="evening">{t("evening")}</option>
            </select>
          </div>
          <Button variant="primary" type="submit" size="md">
            {t("send")}
          </Button>
        </form>
      )}
    </div>
  );
}
