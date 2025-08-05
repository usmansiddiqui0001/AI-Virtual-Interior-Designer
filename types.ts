
export interface FurnitureSuggestion {
  name: string;
  description: string;
  placement: string;
  estimatedPrice: number;
}

export interface ColorPalette {
  color: string;
  accent: string;
}

export interface DesignPlan {
  analysis: string;
  wallColor: ColorPalette;
  lighting: string;
  flooring: string;
  furnitureSuggestions: FurnitureSuggestion[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  alternativePalettes: ColorPalette[];
}

export interface RoomDimensions {
  width: string;
  length: string;
  unit: 'ft' | 'm';
}
