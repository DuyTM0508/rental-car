import { apiClient } from "./client";

export async function getBookings() {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/bookings`,
  });

  return data;
}

export async function cancelBooking(accessToken, bookingId) {
  const { data } = await apiClient.request({
    method: "DELETE",
    url: `/bookings/${bookingId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return data;
}
