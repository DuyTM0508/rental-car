import { apiClient } from "./client";

// export async function getRatingsOfCar(carId, page = 1, limit = 4) {
//   const { data } = await apiClient.request({
//     method: "GET",
//     url: `cars/ratings/${carId}?page=${page}&limit=${limit}`,
//   });

//   return data;
// }

export async function createRating(ratingData) {
  const { accessToken, bookingId, carId, star, comment } = { ...ratingData };
  const { data } = await apiClient.request({
    method: "POST",
    url: "cars/rating/create",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: { bookingId, carId, star, comment },
    withCredentials: true,
  });
  return data;
}

export async function getRatingByBooking(accessToken, bookingId) {
  const { data } = await apiClient.request({
    method: "GET",
    url: `cars/rating/${bookingId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return data;
}
export async function updateRatingByBooking(ratingData) {
  const { accessToken, bookingId, star, comment } = { ...ratingData };
  const { data } = await apiClient.request({
    method: "PUT",
    url: `cars/rating/update/${bookingId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: { bookingId, star, comment },
    withCredentials: true,
  });
  return data;
}
