// src/lib/types.ts
export interface Drug {
  id: number;
  name: string;
  trade_name?: string; // Use trade_name, remove tradeName
  category: string;
  overview: string;
  dosing: string;
  pharmacokinetics: string;
  pharmacodynamics: string;
  clinical_practical_considerations: string;
  is_emergency?: number;
  url?: string;
}
