export type EmsBinaryState = 'Y' | 'N' | boolean | null | undefined;
export type EmsHealthState = 'normal' | 'caution' | 'alert' | 'unknown';

export interface EmsInOutItem {
  date: string;
  affiliate_name: string;
  farm_name: string;
  house_name: string;
  count: number;
  kind: 'input' | 'output';
}

export interface EmsFarmStatus {
  id: string;
  farm_name: string;
  house_name: string;
  rearing: boolean;
  all_working: boolean;
  all_power_on: boolean;
  all_clean: boolean;
  fault: boolean;
  temperature?: number | null;
  humidity?: number | null;
  feedbin?: number | null;
}

export interface EmsDataMonitorResponse {
  iot_system: EmsBinaryState;
  cloud_system: EmsBinaryState;
  service_platform: EmsBinaryState;
  breed_detection: EmsBinaryState;
  weight_prediction: EmsBinaryState;
  total_running_farm_count: number;
  total_farm_count: number;
  total_upbringing_rate: number;
  total_rearing_count: number;
  input_list: EmsInOutItem[];
  output_list: EmsInOutItem[];
  all_farm_list: EmsFarmStatus[];
}

export interface EmsAgeStatFarmItem {
  farm_id: string;
  farm_name: string;
  criteria_rate: number;
}

export interface EmsAgeStatResponse {
  age: number;
  sum_criteria: number;
  farm_map_list: EmsAgeStatFarmItem[];
}
