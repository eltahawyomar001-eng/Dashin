'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@dashin/ui';
import { DollarSign, Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Can } from '@dashin/rbac';

interface CostEstimate {
  scraping: number;
  enrichment: number;
  validation: number;
  storage: number;
  total: number;
}

export default function CostEstimatorPage() {
  const [leadCount, setLeadCount] = useState('1000');
  const [dataPoints, setDataPoints] = useState('15');
  const [enrichmentLevel, setEnrichmentLevel] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [validationEnabled, setValidationEnabled] = useState(true);

  const calculateCosts = (): CostEstimate => {
    const leads = parseInt(leadCount) || 0;
    const points = parseInt(dataPoints) || 0;

    // Cost per lead for scraping (varies by data points)
    const scrapingCostPerLead = 0.10 + (points * 0.02);
    const scraping = leads * scrapingCostPerLead;

    // Enrichment costs (varies by level)
    const enrichmentMultipliers = { basic: 0.05, standard: 0.15, premium: 0.30 };
    const enrichment = leads * enrichmentMultipliers[enrichmentLevel];

    // Validation costs
    const validation = validationEnabled ? leads * 0.08 : 0;

    // Storage costs (per 1000 leads per month)
    const storage = (leads / 1000) * 5;

    const total = scraping + enrichment + validation + storage;

    return { scraping, enrichment, validation, storage, total };
  };

  const costs = calculateCosts();

  const handleLeadCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setLeadCount(value);
  };

  const handleDataPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (parseInt(value) <= 50 || value === '') {
      setDataPoints(value);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary-400" />
          Cost Estimator
        </h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Calculate estimated costs for your lead research campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary-400" />
                Campaign Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lead Count */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Leads
                </label>
                <Input
                  type="text"
                  value={leadCount}
                  onChange={handleLeadCountChange}
                  placeholder="e.g., 1000"
                  className="text-lg"
                />
                <p className="text-sm text-slate-400 mt-1">
                  Enter the target number of leads you want to research
                </p>
              </div>

              {/* Data Points */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data Points per Lead
                </label>
                <Input
                  type="text"
                  value={dataPoints}
                  onChange={handleDataPointsChange}
                  placeholder="e.g., 15"
                  className="text-lg"
                />
                <p className="text-sm text-slate-400 mt-1">
                  Average number of data fields to collect (max 50)
                </p>
              </div>

              {/* Enrichment Level */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enrichment Level
                </label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <button
                    onClick={() => setEnrichmentLevel('basic')}
                    className={`p-4 rounded-lg border transition-all ${
                      enrichmentLevel === 'basic'
                        ? 'border-primary-500 bg-primary-500/20 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">Basic</div>
                    <div className="text-xs text-slate-400">$0.05/lead</div>
                  </button>
                  <button
                    onClick={() => setEnrichmentLevel('standard')}
                    className={`p-4 rounded-lg border transition-all ${
                      enrichmentLevel === 'standard'
                        ? 'border-primary-500 bg-primary-500/20 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">Standard</div>
                    <div className="text-xs text-slate-400">$0.15/lead</div>
                  </button>
                  <button
                    onClick={() => setEnrichmentLevel('premium')}
                    className={`p-4 rounded-lg border transition-all ${
                      enrichmentLevel === 'premium'
                        ? 'border-primary-500 bg-primary-500/20 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">Premium</div>
                    <div className="text-xs text-slate-400">$0.30/lead</div>
                  </button>
                </div>
              </div>

              {/* Validation Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-slate-300">Email & Phone Validation</span>
                    <p className="text-sm text-slate-400 mt-1">
                      Verify contact information accuracy (+$0.08/lead)
                    </p>
                  </div>
                  <button
                    onClick={() => setValidationEnabled(!validationEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      validationEnabled ? 'bg-primary-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        validationEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Web Scraping</span>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                      Base cost + per data point collection fee
                    </div>
                  </div>
                </div>
                <span className="text-white font-semibold">${costs.scraping.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Data Enrichment</span>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                      {enrichmentLevel.charAt(0).toUpperCase() + enrichmentLevel.slice(1)} enrichment level
                    </div>
                  </div>
                </div>
                <span className="text-white font-semibold">${costs.enrichment.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Validation</span>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                      Email and phone number verification
                    </div>
                  </div>
                </div>
                <span className="text-white font-semibold">
                  {validationEnabled ? `$${costs.validation.toFixed(2)}` : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Storage (Monthly)</span>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                      $5 per 1000 leads per month
                    </div>
                  </div>
                </div>
                <span className="text-white font-semibold">${costs.storage.toFixed(2)}/mo</span>
              </div>

              <div className="flex items-center justify-between py-4 mt-4">
                <span className="text-xl font-bold text-white">Total Estimated Cost</span>
                <span className="text-3xl font-bold text-primary-400">${costs.total.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-2 text-sm text-slate-400">
                <p>• Cost per lead: ${(costs.total / (parseInt(leadCount) || 1)).toFixed(3)}</p>
                <p>• Estimated delivery: 3-5 business days</p>
                <p>• Volume discounts available for 10,000+ leads</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4 md:space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Leads</p>
                <p className="text-2xl font-bold text-white">{parseInt(leadCount || '0').toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Cost Per Lead</p>
                <p className="text-2xl font-bold text-white">
                  ${(costs.total / (parseInt(leadCount) || 1)).toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Enrichment</p>
                <p className="text-lg font-semibold text-white capitalize">{enrichmentLevel}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Validation</p>
                <p className="text-lg font-semibold text-white">{validationEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Pricing Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Industry Average</span>
                <span className="text-white font-medium">$0.50/lead</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Your Estimate</span>
                <span className="text-primary-400 font-bold">
                  ${(costs.total / (parseInt(leadCount) || 1)).toFixed(3)}/lead
                </span>
              </div>
              <div className="pt-3 border-t border-slate-700">
                {(costs.total / (parseInt(leadCount) || 1)) < 0.50 ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <TrendingDown className="h-4 w-4" />
                    <span className="font-medium">
                      {Math.round(((0.50 - (costs.total / (parseInt(leadCount) || 1))) / 0.50) * 100)}% below market
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">
                      {Math.round((((costs.total / (parseInt(leadCount) || 1)) - 0.50) / 0.50) * 100)}% above market
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Can permission="cost:view">
            <Button className="w-full gap-2">
              <Calculator className="h-4 w-4" />
              Request Quote
            </Button>
          </Can>
        </div>
      </div>
    </div>
  );
}
