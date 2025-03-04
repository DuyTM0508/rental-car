import { apiClient } from "./client";

export async function getCars() {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/cars?limit=0`,
  });

  return data;
}

export async function getCar(carId) {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/cars/${carId}`,
  });

  return data;
}

export async function createCar({ body, accessToken }) {
  const { data } = await apiClient.request({
    method: "POST",
    url: `/cars/createCar`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: body,
  });

  return data;
}

export async function updateCar({ carId, body, accessToken }) {
  console.log(carId, body);
  const { data } = await apiClient.request({
    method: "PUT",
    url: `/cars/updateCar/${carId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: body,
  });

  return data;
}
export const updateCarStatus = async ({ accessToken, carId, status }) => {
  const { data } = await apiClient.request({
    method: "PUT",
    url: `/admin/update-status-car/${carId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: {
      status,
    },
  });
};
