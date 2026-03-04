export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // e.g., ["08:00", "20:00"]
  foodRequirement: 'before' | 'after' | 'with' | 'none';
  notes?: string;
  imageUrl?: string;
}

export interface Interaction {
  severity: 'severe' | 'moderate' | 'mild' | 'none';
  drugs: string[];
  explanation: string;
  recommendation: string;
  source?: string;
}

export const SEVERITY_COLORS = {
  severe: 'text-red-600 bg-red-50 border-red-200',
  moderate: 'text-orange-600 bg-orange-50 border-orange-200',
  mild: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  none: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

export const SEVERITY_ICONS = {
  severe: '🔴',
  moderate: '🟠',
  mild: '🟡',
  none: '🟢',
};
