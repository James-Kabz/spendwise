"use client";

import { toast } from "@jameskabz/nextcraft-ui";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method: RequestMethod;
  headers: Record<string, string>;
  credentials: RequestCredentials;
  body?: string | FormData;
};

const toastError = (title: string, description?: string) => {
  toast.error(title, description ? { description } : undefined);
};

const redirect = (path: string) => {
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
};

function buildHeaders() {
  return {} as Record<string, string>;
}

function resolveValidationMessage(data: unknown) {
  const record = data as {
    errors?: Record<string, string[]>;
    message?: string;
  };
  if (record?.errors) {
    const firstKey = Object.keys(record.errors)[0];
    const first = record.errors[firstKey]?.[0];
    if (first) return first;
  }
  return record?.message ?? "Validation failed.";
}

async function request<T>(
  method: RequestMethod,
  url: string,
  body?: unknown
): Promise<T> {
  const headers = buildHeaders();
  const options: RequestOptions = {
    method,
    headers,
    credentials: "include",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${url}`, options);
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const status = response.status;
    const message =
      (data as { message?: string })?.message ?? response.statusText;

    switch (status) {
      case 401:
        toastError("Session expired", "Please login again.");
        redirect("/api/auth/signin");
        break;
      case 403:
        toastError("Cannot access");
        redirect("/403");
        break;
      case 404:
        toastError("Not found", "Resource not found.");
        break;
      case 409:
        toastError("Conflict", message || "Conflict error");
        break;
      case 422:
        toastError("Validation error", resolveValidationMessage(data));
        break;
      case 500:
        toastError("Server error", "Something went wrong. Please try again later.");
        redirect("/500");
        break;
      default:
        toastError("Error", message);
        break;
    }

    return Promise.reject({
      response: {
        status,
        data: data ?? { message: response.statusText },
      },
    });
  }

  return data as T;
}

async function requestFile<T>(
  method: RequestMethod,
  url: string,
  formData: FormData
): Promise<T> {
  const headers = buildHeaders();
  const options: RequestOptions = {
    method,
    headers,
    credentials: "include",
    body: formData,
  };

  const response = await fetch(`${baseUrl}${url}`, options);
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const status = response.status;
    const message =
      (data as { message?: string })?.message ?? response.statusText;

    switch (status) {
      case 401:
        toastError("Session expired", "Please login again.");
        redirect("/api/auth/signin");
        break;
      case 403:
        toastError("Cannot access");
        redirect("/403");
        break;
      case 404:
        toastError("Not found", "Resource not found.");
        break;
      case 409:
        toastError("Conflict", message || "Conflict error");
        break;
      case 413:
        toastError("File too large", "The file you are trying to upload is too large.");
        break;
      case 415:
        toastError(
          "Invalid file type",
          "The file type you are trying to upload is not supported."
        );
        break;
      case 422:
        toastError("Validation error", resolveValidationMessage(data));
        break;
      case 500:
        toastError("Server error", "Something went wrong. Please try again later.");
        redirect("/500");
        break;
      default:
        toastError("Error", message);
        break;
    }

    return Promise.reject({
      response: {
        status,
        data: data ?? { message: response.statusText },
      },
    });
  }

  return data as T;
}

async function requestBlob(
  method: RequestMethod,
  url: string,
  filename: string | null = null,
  download = false,
  openInNewTab = false
) {
  const headers = buildHeaders();
  const options: RequestOptions = {
    method,
    headers,
    credentials: "include",
  };

  const response = await fetch(`${baseUrl}${url}`, options);

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const status = response.status;
    const message =
      (data as { message?: string })?.message ?? response.statusText;

    switch (status) {
      case 401:
        toastError("Session expired", "Please login again.");
        redirect("/api/auth/signin");
        break;
      case 403:
        toastError("Cannot access");
        redirect("/403");
        break;
      case 404:
        if (download) {
          toastError("Not found", "Resource not found.");
        }
        break;
      default:
        toastError("Error", message);
        break;
    }

    return Promise.reject({
      response: {
        status,
        data: data ?? { message: response.statusText },
      },
    });
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  if (download) {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return { success: true };
  }

  if (openInNewTab) {
    window.open(blobUrl, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    return { success: true };
  }

  return blobUrl;
}

export const fetchWrapper = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body),
  patch: <T>(url: string, body?: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string) => request<T>("DELETE", url),
  postFile: <T>(url: string, formData: FormData) =>
    requestFile<T>("POST", url, formData),
  updateFile: <T>(url: string, formData: FormData) =>
    requestFile<T>("PUT", url, formData),
  downloadFile: (url: string, filename?: string | null) =>
    requestBlob("GET", url, filename ?? null, true),
  viewFile: (url: string, openInNewTab = false) =>
    requestBlob("GET", url, null, false, openInNewTab),
};
