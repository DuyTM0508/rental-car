import { apiClient } from "./client";

export async function getGPLX(accessToken) {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/drivers`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return data;
}
export async function acceptLicensesDriver(accessToken, driverId) {
  const { data } = await apiClient.request({
    method: "PUT",
    url: `/drivers/acceptDriver/${driverId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: { status: "Đã xác thực" },
  });
  return data;
}

export async function deleteDriverLicense(driverId, accessToken) {
  const { data } = await apiClient.request({
    method: "DELETE",
    url: `/drivers/deleteDriver/${driverId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return data;
}
