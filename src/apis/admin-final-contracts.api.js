import { apiClient } from "./client";

export async function getFinalContracts(accessToken, role) {
  const { data } = await apiClient.request({
    method: "GET",
    url:
      role === "admin"
        ? `/final-contracts/listFinalContracts`
        : `/final-contracts`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return data;
}
