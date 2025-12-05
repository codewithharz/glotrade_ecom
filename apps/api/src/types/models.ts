// src/types/models.ts - Shared interfaces

// validations to our models:
export interface ILocation {
  country: string;
  city?: string;
  coordinates?: [number, number];
}

export interface IShippingDetails {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface IVestingSchedule {
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  releasedAmount: number;
  interval: "daily" | "weekly" | "monthly";
}
