import { apiClient } from "./client";

export async function getContracts(accessToken) {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/contracts`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return data;
}

export async function getListContracts(accessToken, role) {
  const { data } = await apiClient.request({
    method: "GET",
    url: role === "admin" ? `/contracts/listContracts` : `/contracts`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return data;
}
