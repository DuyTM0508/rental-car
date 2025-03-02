import { apiClient } from "./client";
import queryString from "query-string";

export async function updateUser({ params, queries, body = {} } = {}) {
  const { data } = await apiClient.request({
    method: "PUT",
    url: `/users/${id}`,
    data: body,
    params: queryString.stringify(queries),
  });

  return data;
}
