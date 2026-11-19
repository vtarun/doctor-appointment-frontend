import { axiosInstance } from "@/shared/api/axiosInstance";
import type { DoctorApplication, DoctorApplicationSummary } from "./doctorApproval.api";

export interface VerifiedDoctor extends DoctorApplicationSummary {
  email: string;
  verificationStatus: "VERIFIED";
}

export interface AdminPayout {
  id: string;
  doctor: { name: string; email?: string; specialty?: string };
  creditsRequested: number;
  grossAmount?: number;
  feeAmount?: number;
  netAmount: number;
  currency: string;
  destination?: string;
  createdAt: string;
  status: "PROCESSING" | "PROCESSED" | "REJECTED";
  canApprove: boolean;
  ineligibilityReason?: string;
}

export const adminManagement = {
  pending: async () => {
    const response = await axiosInstance.get<DoctorApplicationSummary[]>("/admin/doctors/pending");
    return response.data;
  },
  application: async (id: string) => {
    const response = await axiosInstance.get<DoctorApplication>(`/admin/doctors/${encodeURIComponent(id)}`);
    return response.data;
  },
  credential: async (id: string, credentialId: string) => {
    const response = await axiosInstance.get<Blob>(
      `/admin/doctors/${encodeURIComponent(id)}/credentials/${encodeURIComponent(credentialId)}`,
      { responseType: "blob" },
    );
    return response.data;
  },
  verified: async () => {
    const response = await axiosInstance.get<VerifiedDoctor[]>("/admin/doctors/verified");
    return response.data;
  },
  payouts: async () => {
    const response = await axiosInstance.get<AdminPayout[]>("/admin/payouts");
    return response.data;
  },
  approvePayout: async (id: string) => {
    const response = await axiosInstance.post<AdminPayout>(`/admin/payouts/${encodeURIComponent(id)}/approve`);
    return response.data;
  },
};
