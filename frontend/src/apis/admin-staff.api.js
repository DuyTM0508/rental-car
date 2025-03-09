import { message } from "antd";
import { apiClient } from "./client";

export const getStaffs = async ({ accessToken }) => {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/admin/staffs`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};

export const upsertStaff = async ({ accessToken, body, staffId }) => {
  const { data } = await apiClient.request({
    method: staffId ? "PUT" : "POST",
    url: staffId ? `users/update-user/${staffId}` : `/admin/create-staffs`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: body,
  });

  return data;
};

export const getUser = async ({ accessToken, userId }) => {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/admin/get-user/${userId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};

export const getUsers = async ({ accessToken }) => {
  const { data } = await apiClient.request({
    method: "GET",
    url: `/admin/list-users`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return data?.result;
};

export const updateUserStatus = async ({ accessToken, userId, status }) => {
  const { data } = await apiClient.request({
    method: "PUT",
    url: `/admin/update-status/${userId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: {
      status,
    },
  });
};

