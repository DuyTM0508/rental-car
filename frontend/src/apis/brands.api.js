import { apiClient } from "./client";

export async function getBrands() {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/brands`,
  });

  return data;
}
