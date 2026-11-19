import { getApiErrorMessage } from "@/shared/api/apiError";
import { axiosInstance } from "@/shared/api/axiosInstance";

// Frontend view models. A review API adapter maps its responses to these types.
export interface DoctorApplicationSummary {
  doctorId: string;
  name: string;
  specialty?: string;
  experienceYears?: number;
  submittedAt?: string;
}

export interface DoctorCredential {
  id: string;
  name?: string;
}

export interface DoctorApplication extends DoctorApplicationSummary {
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  dateOfBirth?: string;
  gender?: string;
  qualification?: string;
  bio?: string;
  clinicName?: string;
  city?: string;
  consultationType?: string;
  consultationFee?: number;
  credentials?: DoctorCredential[];
}

interface DoctorApprovalResponse {
  _id: string;
  verificationStatus: "VERIFIED";
  updatedAt: string;
}

export function getAdminDoctorErrorMessage(
  error: unknown,
  fallback: string,
  statusMessages: Partial<Record<number, string>> = {},
) {
  return getApiErrorMessage(error, fallback, {
    401: "Your session has expired. Sign in again to continue.",
    403: "Only admins can manage doctor applications.",
    ...statusMessages,
  });
}

export async function approveDoctor(doctorId: string): Promise<DoctorApprovalResponse> {
  const { data } = await axiosInstance.post<DoctorApprovalResponse>(
    `/admin/doctor/${encodeURIComponent(doctorId)}/verify`,
  );
  return {
    _id: data._id,
    verificationStatus: data.verificationStatus,
    updatedAt: data.updatedAt,
  };
}
