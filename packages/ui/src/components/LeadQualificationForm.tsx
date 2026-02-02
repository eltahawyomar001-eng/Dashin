import React from 'react';
import { QualificationScore, QualificationCriteria } from '@dashin/shared-types';
import { CheckCircle, XCircle } from 'lucide-react';

export interface LeadQualificationFormProps {
  leadId: string;
  leadName: string;
  onApprove: (data: QualificationFormData) => void;
  onReject: (data: QualificationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface QualificationFormData {
  score: QualificationScore;
  criteria: QualificationCriteria;
  notes: string;
  rejectionReason?: string;
}

const REJECTION_REASONS = [
  'Company size mismatch',
  'Wrong industry',
  'Location not suitable',
  'Insufficient budget',
  'No decision-making authority',
  'No immediate need',
  'Competitor',
  'Duplicate lead',
  'Invalid contact information',
  'Other',
];

export const LeadQualificationForm: React.FC<LeadQualificationFormProps> = ({
  leadName,
  onApprove,
  onReject,
  onCancel,
  isSubmitting = false,
}) => {
  const [score, setScore] = React.useState<QualificationScore>(3);
  const [companySize, setCompanySize] = React.useState<'match' | 'too_small' | 'too_large'>('match');
  const [industry, setIndustry] = React.useState<'match' | 'mismatch'>('match');
  const [location, setLocation] = React.useState<'match' | 'mismatch'>('match');
  const [budget, setBudget] = React.useState<'sufficient' | 'insufficient' | 'unknown'>('sufficient');
  const [authority, setAuthority] = React.useState<'decision_maker' | 'influencer' | 'gatekeeper' | 'unknown'>('decision_maker');
  const [need, setNeed] = React.useState<'immediate' | 'future' | 'none'>('immediate');
  const [timing, setTiming] = React.useState<'now' | 'quarter' | 'year' | 'unknown'>('now');
  const [notes, setNotes] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');

  const getCriteriaData = (): QualificationCriteria => ({
    companySize,
    industry,
    location,
    budget,
    authority,
    need,
    timing,
  });

  const getFormData = (): QualificationFormData => ({
    score,
    criteria: getCriteriaData(),
    notes,
    rejectionReason: rejectionReason || undefined,
  });

  const handleApprove = () => {
    onApprove(getFormData());
  };

  const handleReject = () => {
    onReject(getFormData());
  };

  const getScoreColor = (s: QualificationScore): string => {
    const colors: Record<QualificationScore, string> = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-green-500',
      5: 'bg-emerald-500',
    };
    return colors[s] || 'bg-yellow-500';
  };

  const getScoreLabel = (s: QualificationScore): string => {
    const labels: Record<QualificationScore, string> = {
      1: 'Poor Fit',
      2: 'Fair Fit',
      3: 'Good Fit',
      4: 'Very Good Fit',
      5: 'Excellent Fit',
    };
    return labels[s] || 'Good Fit';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Qualify Lead</h3>
        <p className="text-sm text-gray-400">{leadName}</p>
      </div>

      {/* Score Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Overall Score
        </label>
        <div className="space-y-3">
          {/* Score Slider */}
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value) as QualificationScore)}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex items-center gap-2 min-w-[120px]">
              <div className={`w-8 h-8 ${getScoreColor(score)} rounded-full flex items-center justify-center text-white font-bold`}>
                {score}
              </div>
              <span className="text-sm text-gray-300">/5</span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400">{getScoreLabel(score)}</p>
        </div>
      </div>

      {/* Qualification Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Size
          </label>
          <select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="match">Match</option>
            <option value="too_small">Too Small</option>
            <option value="too_large">Too Large</option>
          </select>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Industry Match
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="match">Match</option>
            <option value="mismatch">Mismatch</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="match">Match</option>
            <option value="mismatch">Mismatch</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Budget
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sufficient">Sufficient</option>
            <option value="insufficient">Insufficient</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Authority */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Authority Level
          </label>
          <select
            value={authority}
            onChange={(e) => setAuthority(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="decision_maker">Decision Maker</option>
            <option value="influencer">Influencer</option>
            <option value="gatekeeper">Gatekeeper</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Need */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Need Level
          </label>
          <select
            value={need}
            onChange={(e) => setNeed(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="immediate">Immediate</option>
            <option value="future">Future</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* Timing */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Purchase Timing
          </label>
          <select
            value={timing}
            onChange={(e) => setTiming(e.target.value as any)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="now">Now</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Rejection Reason (shown when score is low) */}
        {score <= 2 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejection Reason
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a reason...</option>
              {REJECTION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this lead..."
          rows={4}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          Approve Lead
        </button>
        <button
          onClick={handleReject}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="w-5 h-5" />
          Reject Lead
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
