import { apiClient } from "./client";

export const getAdminDashboard = async ({ accessToken }) => {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/admin/admin-dashboard`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return data?.result;
};

export const getTotalRevenueByMonth = async ({ accessToken }) => {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/admin/total-revenue-by-month`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return data?.result;
};
