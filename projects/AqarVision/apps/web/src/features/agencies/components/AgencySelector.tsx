"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCurrentAgency } from "../hooks/use-current-agency";

export function AgencySelector() {
  const t = useTranslations("agencies");
  const router = useRouter();
  const { agency, agencies, setCurrentAgency, loading } = useCurrentAgency();

  if (loading) {
    return (
      <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
    );
  }

  if (agencies.length === 0) {
    return null;
  }

  if (agencies.length === 1 && agency) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
        {agency.logo_url ? (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-xs font-bold text-white">
            {agency.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {agency.name}
        </span>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setCurrentAgency(newId);
    router.push("/AqarPro/dashboard");
  };

  return (
    <div className="flex items-center gap-2">
      {agency?.logo_url ? (
        <img
          src={agency.logo_url}
          alt={agency.name}
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : agency ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-xs font-bold text-white">
          {agency.name.charAt(0).toUpperCase()}
        </div>
      ) : null}
      <select
        value={agency?.id ?? ""}
        onChange={handleChange}
        aria-label={t("switch_agency")}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20"
      >
        {agencies.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
