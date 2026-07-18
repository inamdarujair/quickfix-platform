import axios from "axios";

export const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function fileUrl(path) {
  if (!path) return null;
  return `${API_BASE_URL}/files/${path}`;
}

export function resolveImage(entity, externalKey = "image_url_external", pathKey = "images") {
  if (!entity) return null;
  const paths = entity[pathKey];
  if (Array.isArray(paths) && paths.length > 0) return fileUrl(paths[0]);
  return entity[externalKey] || null;
}

export function resolveAvatar(user) {
  if (!user) return null;
  if (user.avatar_path) return fileUrl(user.avatar_path);
  return user.avatar_url_external || null;
}

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
