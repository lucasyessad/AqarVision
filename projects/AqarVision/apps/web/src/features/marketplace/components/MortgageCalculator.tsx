"use client";

import { useState, useMemo } from "react";

interface MortgageCalculatorProps {
  defaultPrice: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Monthly payment formula:
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 * where P = principal, r = monthly rate, n = number of months
 */
function calcMortgage(
  price: number,
  downPaymentPct: number,
  durationYears: number,
  annualRatePct: number
): { monthly: number; total: number; totalInterest: number } {
  const principal = price * (1 - downPaymentPct / 100);
  const n = durationYears * 12;
  const r = annualRatePct / 100 / 12;

  if (r === 0) {
    const monthly = principal / n;
    return { monthly, total: principal, totalInterest: 0 };
  }

  const factor = Math.pow(1 + r, n);
  const monthly = (principal * (r * factor)) / (factor - 1);
  const total = monthly * n;
  const totalInterest = total - principal;

  return { monthly, total, totalInterest };
}

export function MortgageCalculator({ defaultPrice }: MortgageCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [durationYears, setDurationYears] = useState(20);
  const [annualRatePct, setAnnualRatePct] = useState(5.5);

  const result = useMemo(
    () => calcMortgage(price, downPaymentPct, durationYears, annualRatePct),
    [price, downPaymentPct, durationYears, annualRatePct]
  );

  const isValid =
    price > 0 &&
    downPaymentPct >= 0 &&
    downPaymentPct < 100 &&
    durationYears >= 1 &&
    annualRatePct >= 0;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#2d3748]">
        Calculateur de crédit immobilier
      </h3>

      <div className="space-y-3">
        {/* Prix du bien */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a0aec0]">
            Prix du bien (DZD)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
            step={100000}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#2d3748] outline-none focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d]"
          />
        </div>

        {/* Apport */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-[#a0aec0]">
              Apport personnel
            </label>
            <span className="text-xs font-semibold text-[#1a365d]">
              {downPaymentPct}% — {formatCurrency((price * downPaymentPct) / 100)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            className="w-full accent-[#1a365d]"
          />
        </div>

        {/* Durée */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-[#a0aec0]">Durée</label>
            <span className="text-xs font-semibold text-[#1a365d]">
              {durationYears} ans
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={durationYears}
            onChange={(e) => setDurationYears(Number(e.target.value))}
            className="w-full accent-[#1a365d]"
          />
        </div>

        {/* Taux annuel */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a0aec0]">
            Taux annuel (%)
          </label>
          <input
            type="number"
            value={annualRatePct}
            onChange={(e) => setAnnualRatePct(Number(e.target.value))}
            min={0}
            max={30}
            step={0.1}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#2d3748] outline-none focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d]"
          />
        </div>
      </div>

      {/* Results */}
      {isValid && (
        <div className="mt-5 rounded-xl bg-[#1a365d] p-4 text-white">
          <div className="mb-3 text-center">
            <p className="text-xs font-medium text-white/60">Mensualité estimée</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(result.monthly)}
            </p>
            <p className="text-xs text-white/60">/ mois</p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div className="text-center">
              <p className="text-xs text-white/60">Coût total</p>
              <p className="mt-0.5 text-sm font-semibold">
                {formatCurrency(result.total + (price * downPaymentPct) / 100)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/60">Total intérêts</p>
              <p className="mt-0.5 text-sm font-semibold text-[#d4af37]">
                {formatCurrency(result.totalInterest)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-white/40">
            Simulation indicative — consultez votre banque pour une offre précise.
          </p>
        </div>
      )}

      {!isValid && (
        <p className="mt-4 text-center text-xs text-red-500">
          Veuillez vérifier les valeurs saisies.
        </p>
      )}
    </div>
  );
}
