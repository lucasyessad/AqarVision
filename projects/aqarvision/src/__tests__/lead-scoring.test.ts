import { describe, it, expect } from 'vitest';
import { calculateLeadScore, LEAD_SCORE_COLORS, LEAD_SCORE_LABELS } from '@/lib/lead-scoring';
import type { Lead } from '@/types/database';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-1',
    agency_id: 'agency-1',
    property_id: null,
    assigned_to: null,
    name: 'Ahmed',
    phone: '0555123456',
    email: null,
    message: null,
    source: 'contact_form',
    status: 'new',
    priority: 'normal',
    budget_min: null,
    budget_max: null,
    desired_country: null,
    desired_wilaya: null,
    desired_type: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    contacted_at: null,
    ...overrides,
  };
}

describe('calculateLeadScore', () => {
  it('gives points for phone', () => {
    const result = calculateLeadScore(makeLead({ phone: '0555123456' }));
    expect(result.score).toBeGreaterThan(0);
    expect(result.factors).toContain('Téléphone fourni');
  });

  it('gives more points for email', () => {
    const withEmail = calculateLeadScore(makeLead({ email: 'test@test.com' }));
    const withoutEmail = calculateLeadScore(makeLead());
    expect(withEmail.score).toBeGreaterThan(withoutEmail.score);
  });

  it('gives points for detailed message', () => {
    const longMsg = 'A'.repeat(150);
    const result = calculateLeadScore(makeLead({ message: longMsg }));
    expect(result.factors).toContain('Message détaillé');
  });

  it('gives points for short message', () => {
    const result = calculateLeadScore(makeLead({ message: 'Bonjour, je suis intéressé par ce bien.' }));
    expect(result.factors).toContain('Message présent');
  });

  it('gives points for property_id', () => {
    const result = calculateLeadScore(makeLead({ property_id: 'prop-1' }));
    expect(result.factors).toContain('Bien ciblé');
  });

  it('gives points for budget', () => {
    const result = calculateLeadScore(makeLead({ budget_min: 5000000 }));
    expect(result.factors).toContain('Budget défini');
  });

  it('gives points for desired_wilaya', () => {
    const result = calculateLeadScore(makeLead({ desired_wilaya: 'Alger' }));
    expect(result.factors).toContain('Wilaya souhaitée');
  });

  it('gives points for desired_type', () => {
    const result = calculateLeadScore(makeLead({ desired_type: 'appartement' }));
    expect(result.factors).toContain('Type souhaité');
  });

  it('classifies minimal lead as cold', () => {
    const result = calculateLeadScore(makeLead());
    expect(result.level).toBe('cold');
  });

  it('classifies well-detailed lead as warm or hot', () => {
    const result = calculateLeadScore(makeLead({
      email: 'test@test.com',
      message: 'A'.repeat(150),
      property_id: 'prop-1',
      budget_min: 5000000,
      source: 'property_detail',
    }));
    expect(['warm', 'hot']).toContain(result.level);
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it('classifies fully detailed lead as hot', () => {
    const result = calculateLeadScore(makeLead({
      email: 'test@test.com',
      message: 'A'.repeat(200),
      property_id: 'prop-1',
      budget_min: 5000000,
      budget_max: 10000000,
      desired_wilaya: 'Alger',
      desired_type: 'villa',
      source: 'walk_in',
    }));
    expect(result.level).toBe('hot');
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('caps score at 100', () => {
    const result = calculateLeadScore(makeLead({
      email: 'test@test.com',
      message: 'A'.repeat(200),
      property_id: 'prop-1',
      budget_min: 5000000,
      budget_max: 10000000,
      desired_wilaya: 'Alger',
      desired_type: 'villa',
      source: 'walk_in',
    }));
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('higher source score for walk_in vs contact_form', () => {
    const walkIn = calculateLeadScore(makeLead({ source: 'walk_in' }));
    const form = calculateLeadScore(makeLead({ source: 'contact_form' }));
    expect(walkIn.score).toBeGreaterThan(form.score);
  });
});

describe('lead score constants', () => {
  it('has colors for all levels', () => {
    expect(LEAD_SCORE_COLORS.hot).toBeDefined();
    expect(LEAD_SCORE_COLORS.warm).toBeDefined();
    expect(LEAD_SCORE_COLORS.cold).toBeDefined();
  });

  it('has labels for all levels', () => {
    expect(LEAD_SCORE_LABELS.hot).toBe('Chaud');
    expect(LEAD_SCORE_LABELS.warm).toBe('Tiède');
    expect(LEAD_SCORE_LABELS.cold).toBe('Froid');
  });
});
