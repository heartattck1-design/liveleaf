export interface PlantCareRange {
  minimum?: number;
  maximum?: number;
  idealRange?: string;
  unit: string;
  guidance?: string;
  recommendation?: string;
}

export interface PlantProfile {
  commonName: string;
  scientificName: string;
  species?: string;
  plantType?: string;
  confidence?: string;
  care: {
    temperature: PlantCareRange;
    soilMoisture: PlantCareRange;
    airHumidity: PlantCareRange;
    light: PlantCareRange;
  };
  recommendations: string[];
}
