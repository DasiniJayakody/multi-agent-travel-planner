import { apiGet, buildQueryParams } from "@/lib/api";
import type {
  FlightBookingsResponse,
  HotelBookingsResponse,
  UserBookings,
  AllBookingsResponse,
} from "@/lib/types";

export const bookingsApi = {
  // Get all bookings with user details
  getAllBookings: (): Promise<AllBookingsResponse> => {
    return apiGet<AllBookingsResponse>("/bookings/all");
  },

  // Get all flight bookings
  getFlightBookings: (): Promise<FlightBookingsResponse> => {
    return apiGet<FlightBookingsResponse>("/bookings/flights");
  },

  // Get all hotel bookings
  getHotelBookings: (): Promise<HotelBookingsResponse> => {
    return apiGet<HotelBookingsResponse>("/bookings/hotels");
  },

  // Get bookings for a specific user
  getUserBookings: (email: string): Promise<UserBookings> => {
    const queryParams = buildQueryParams({ email });
    return apiGet<UserBookings>(`/bookings/user${queryParams}`);
  },
};
