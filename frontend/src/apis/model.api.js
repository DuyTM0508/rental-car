import { apiClient } from "./client";

export async function getMOdels(brandId) {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/models/${brandId}`,
  });

  return data;
}
