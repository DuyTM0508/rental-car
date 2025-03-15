import { apiClient } from "./client";

export async function getCoupons() {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/coupons`,
  });

  return data;
}

export async function getCouponById(couponId, accessToken) {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/coupons/${couponId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return data;
}
export async function createCoupon({ body, accessToken }) {
  const { data } = await apiClient.request({
    method: "POST",
    url: `/coupons/createCoupon`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: body,
  });

  return data;
}

export async function updateCoupon({ couponId, body, accessToken }) {
  const { data } = await apiClient.request({
    method: "PUT",
    url: `/coupons/update/${couponId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: body,
  });

  return data;
}
export async function deleteCoupon(couponId, accessToken) {
  const { data } = await apiClient.request({
    method: "DELETE",
    url: `/coupons/deleteCoupon/${couponId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return data;
}
