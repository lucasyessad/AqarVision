'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

interface MortgageCalculatorProps {
  defaultPrice?: number;
}

function formatDZD(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' DZD';
}

export function MortgageCalculator({ defaultPrice }: MortgageCalculatorProps) {
  const [price, setPrice] = useState<number>(defaultPrice ?? 10_000_000);
  const [apport, setApport] = useState<number>(defaultPrice ? Math.round(defaultPrice * 0.2) : 2_000_000);
  const [years, setYears] = useState<number>(20);
  const [rate, setRate] = useState<number>(5.75);

  const [monthly, setMonthly] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [capital, setCapital] = useState<number>(0);

  useEffect(() => {
    const c = Math.max(0, price - apport);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    let m: number;
    if (c <= 0) {
      m = 0;
    } else if (monthlyRate > 0) {
      m = (c * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    } else {
      m = c / months;
    }

    const total = m * months;
    const interest = total - c;

    setCapital(c);
    setMonthly(Math.round(m));
    setTotalCost(Math.round(total));
    setTotalInterest(Math.round(interest));
  }, [price, apport, years, rate]);

  const loanRatio = price > 0 ? Math.round(((price - apport) / price) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-lg bg-blue-100 p-2">
          <Calculator className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Calculateur de crédit</h2>
      </div>

      <div className="space-y-5">
        {/* Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Prix du bien (DZD)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            step={500_000}
            min={0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Apport */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Apport personnel (DZD)
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({loanRatio}% financé)
            </span>
          </label>
          <input
            type="number"
            value={apport}
            onChange={(e) => setApport(Math.max(0, Number(e.target.value)))}
            step={100_000}
            min={0}
            max={price}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Duration slider */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Durée du crédit</label>
            <span className="text-sm font-semibold text-blue-600">{years} ans</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>5 ans</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30 ans</span>
          </div>
        </div>

        {/* Interest rate */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Taux d&apos;intérêt (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Math.max(0, Math.min(30, Number(e.target.value))))}
            step={0.25}
            min={0}
            max={30}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      {capital > 0 && (
        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-blue-600 p-4 text-center text-white">
            <p className="text-sm font-medium opacity-80">Mensualité estimée</p>
            <p className="mt-1 text-3xl font-bold">{formatDZD(monthly)}</p>
            <p className="mt-0.5 text-xs opacity-70">sur {years * 12} mois</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-[11px] text-gray-500">Coût total</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {(totalCost / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-gray-400">DZD</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="text-[11px] text-gray-500">Dont intérêts</p>
              <p className="mt-1 text-sm font-semibold text-red-700">
                {(totalInterest / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-gray-400">DZD</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-[11px] text-gray-500">Capital</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {(capital / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-gray-400">DZD</p>
            </div>
          </div>

          {/* Cost breakdown bar */}
          <div className="overflow-hidden rounded-full bg-gray-200" style={{ height: 8 }}>
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.round((capital / totalCost) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Capital ({Math.round((capital / totalCost) * 100)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
              Intérêts ({Math.round((totalInterest / totalCost) * 100)}%)
            </span>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-[11px] text-gray-400">
        Simulation indicative — Consultez votre banque pour une offre personnalisée
      </p>
    </div>
  );
}
