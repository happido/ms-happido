import { CartItem } from '@/utils/cartHelper';

export interface AIMacroBreakdown {
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  glycemicIndex: 'Low (< 45)' | 'Medium (45-69)' | 'High (70+)';
}

export interface AIMealRecommendation {
  id: string;
  title: string;
  subtitle: string;
  healthCategory: 'Diabetic Safe' | 'Cardiac Friendly' | 'Post-Surgery Soft Diet' | 'High-Protein Fitness' | 'Weight Loss / Low Carb' | 'Balanced Healthy';
  medicalSafetyScore: number; // percentage, e.g. 98
  clinicalNote: string;
  macros: AIMacroBreakdown;
  dishes: {
    item: CartItem;
    categoryTag: string;
    portionDesc: string;
    kitchenName: string;
  }[];
  couponCode: string;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
}

import api from '../utils/api';

export const PRESET_AI_PROMPTS = [
  {
    id: 'diabetic',
    icon: 'heart-circle',
    label: 'Diabetic Low-GI',
    hint: 'Low glycemic, fiber-rich, zero added sugar',
    color: '#059669',
  },
  {
    id: 'protein',
    icon: 'barbell',
    label: 'High Protein',
    hint: '40g+ protein, muscle recovery',
    color: '#EA580C',
  },
  {
    id: 'recovery',
    icon: 'medkit',
    label: 'Patient Soft Diet',
    hint: 'Post-op gentle digestion, zero spice',
    color: '#3B82F6',
  },
  {
    id: 'budget_family',
    icon: 'people',
    label: 'Family Dinner < ₹450',
    hint: 'Healthy wholesome meal for 3',
    color: '#EA580C',
  },
];

export async function getAIMealRecommendation(promptKeyOrQuery: string): Promise<AIMealRecommendation> {
  try {
    const response = await api.post('/ai/curate', { promptKeyOrQuery });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch AI meal recommendation from backend:', error);
    throw error;
  }
}
