export interface Drug {
  id: number;
  name: string;
  trade_name?: string;
  overview: string;
  dosing: string;
  pharmacokinetics: string;
  pharmacodynamics: string;
  clinical_practical_considerations: string;
  is_emergency?: number;
  url?: string;
  
}
