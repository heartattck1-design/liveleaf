export interface PlantAnalysisResponse {
  analysis: {
    environment_analysis: {
      air_humidity: {
        current_percent: number | null;
        status: string;
      };
      overall_condition: string;
      soil_moisture: {
        current_percent: number | null;
        status: string;
      };
      temperature: {
        current_celsius: number | null;
        status: string;
      };
    };
    environment_requirements: {
      air_humidity: {
        ideal_range: string;
        maximum_percent: number;
        minimum_percent: number;
      };
      soil_moisture: {
        ideal_range: string;
        maximum_percent: number;
        minimum_percent: number;
        watering_guidance: string;
      };
      temperature: {
        ideal_range: string;
        maximum_celsius: number;
        minimum_celsius: number;
      };
      light?: {
        ideal_range?: string;
        maximum_lux?: number;
        minimum_lux?: number;
        recommendation?: string;
      };
    };
    health_analysis: {
      condition: string;
      disease_confidence: string;
      possible_disease: string;
      symptoms: string[];
    };
    monitoring_schedule: {
      abnormal_conditions: {
        reason: string;
        recommended_interval_minutes: number;
      };
      alert_conditions: string[];
      normal_conditions: {
        air_humidity_interval_minutes: number;
        complete_cycle_interval_minutes: number;
        soil_moisture_interval_minutes: number;
        temperature_interval_minutes: number;
      };
      plant_health_issues: {
        reason: string;
        recommended_interval_minutes: number;
      };
    };
    plant_identification: {
      common_name: string;
      confidence: string;
      plant_type: string;
      scientific_name: string;
      species: string;
    };
    recommendations: string[];
    reference_images: string[];
    summary: string;
  };
  device_status: string;
  msg: string;
  sensor_data_used: Record<string, unknown>;
}
