export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  country?: string;
  admin1?: string;
}

export type CitiesList = City[];
