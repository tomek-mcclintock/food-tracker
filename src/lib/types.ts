export interface WellnessEntry {
  type: 'wellness';
  date: string;
  stomach: number;
  energy: number;
}

export interface FoodEntry {
  type: 'food';
  date: string;
  food: string;
  ingredients: string;
  sensitivities: string[];
}

export type HistoryEntry = WellnessEntry | FoodEntry;

export interface DayFood {
  time: string;
  food: string;
  ingredients: string;
  sensitivities: string[];
}

export interface DayWellness {
  date: string;
  stomach: number;
  energy: number;
}

export interface DayData {
  date: string;
  wellness: DayWellness | null;
  foods: DayFood[];
}

export interface FoodAnalysisResult {
  mainItem: string;
  ingredients: string[];
  sensitivities: string[];
}
