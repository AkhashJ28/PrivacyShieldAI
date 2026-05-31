import axios from "axios";
import type { AuthUser } from "./auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface DocumentItem {
  id: string;
  original_name: string;
  file_name: string;
  file_url: string;
  content_type?: string;
  media_type?: "image" | "video";
  processing_status: string | null;
  created_at: string;
}

export interface AccessRequest {
  id: string;
  document_id: string;
  officer_name: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  documents?: Pick<DocumentItem, "original_name" | "file_url"> | null;
}

export interface AuditLog {
  id: string;
  action: string;
  admin_name: string;
  details?: string;
  request_id?: string | null;
  created_at: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "officer";
  status: string;
  created_at?: string;
}

export const api = axios.create({
  baseURL: API_URL,
});

export const loginUser = async (email: string, password: string) => {
  const response = await api.post<{ success: boolean; user?: AuthUser; message?: string }>("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const uploadMedia = async (
  file: File,
  officerName: string,
  onProgress?: (pct: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("officer_name", officerName);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get<{ success: boolean; documents: DocumentItem[] }>("/documents");
  return response.data;
};

export const getDocument = async (id: string) => {
  const response = await api.get<{ success: boolean; document: DocumentItem }>(`/documents/${id}`);
  return response.data;
};

export const createAccessRequest = async (data: {
  document_id: string;
  officer_name: string;
  reason: string;
}) => {
  const response = await api.post("/requests", data);
  return response.data;
};

export const getRequests = async () => {
  const response = await api.get<{ success: boolean; requests: AccessRequest[] }>("/requests");
  return response.data;
};

export const updateRequestStatus = async (
  id: string,
  status: "approved" | "rejected",
  adminName: string
) => {
  const response = await api.patch(`/admin/${id}`, { status, admin_name: adminName });
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get<{ success: boolean; logs: AuditLog[] }>("/admin/audit-logs");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get<{ success: boolean; users: SystemUser[] }>("/admin/users");
  return response.data;
};
