import type { PlantAnalysisResponse } from '../types/plantAnalysis';
import type { PlantProfile } from '../types/plant';

export function createBasicPlantProfile(commonName: string, scientificName: string): PlantProfile {
  return {
    commonName,
    scientificName,
    care: {
      temperature: { unit: '°C' },
      soilMoisture: { unit: '%' },
      airHumidity: { unit: '%' },
      light: { unit: 'lux' },
    },
    recommendations: [],
  };
}

export function createPlantProfileFromAnalysis(result: PlantAnalysisResponse): PlantProfile {
  const analysis = result.analysis;
  const requirements = analysis.environment_requirements;
  const lightRecommendation =
    requirements.light?.recommendation ??
    analysis.recommendations.find((recommendation) => /light/i.test(recommendation));

  return {
    commonName: analysis.plant_identification.common_name,
    scientificName: analysis.plant_identification.scientific_name,
    species: analysis.plant_identification.species,
    plantType: analysis.plant_identification.plant_type,
    confidence: analysis.plant_identification.confidence,
    care: {
      temperature: {
        minimum: requirements.temperature.minimum_celsius,
        maximum: requirements.temperature.maximum_celsius,
        idealRange: requirements.temperature.ideal_range,
        unit: '°C',
      },
      soilMoisture: {
        minimum: requirements.soil_moisture.minimum_percent,
        maximum: requirements.soil_moisture.maximum_percent,
        idealRange: requirements.soil_moisture.ideal_range,
        guidance: requirements.soil_moisture.watering_guidance,
        unit: '%',
      },
      airHumidity: {
        minimum: requirements.air_humidity.minimum_percent,
        maximum: requirements.air_humidity.maximum_percent,
        idealRange: requirements.air_humidity.ideal_range,
        unit: '%',
      },
      light: {
        minimum: requirements.light?.minimum_lux,
        maximum: requirements.light?.maximum_lux,
        idealRange: requirements.light?.ideal_range,
        recommendation: lightRecommendation,
        unit: 'lux',
      },
    },
    recommendations: [...analysis.recommendations],
  };
}
