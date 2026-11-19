import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/axiosInstance";

const profilePath = "/users/me";

export interface ProfileFields {
  name: string;
  dateOfBirth: string;
  gender: string;
}

export interface AccountProfile extends ProfileFields {
  email: string;
  avatarUrl: string | null;
}

type AccountResponse = Omit<AccountProfile, "avatarUrl"> & { avatarUrl?: string | null };

interface SaveProfileInput {
  fields: ProfileFields;
  photo?: File | null;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

function toProfile(data: AccountResponse): AccountProfile {
  return {
    name: data.name,
    email: data.email,
    dateOfBirth: data.dateOfBirth?.slice(0, 10) ?? "",
    gender: data.gender?.toUpperCase() ?? "",
    avatarUrl: data.avatarUrl ?? null,
  };
}

export async function saveProfile({ fields, photo }: SaveProfileInput): Promise<AccountProfile> {
  const body = new FormData();
  body.set("name", fields.name);
  body.set("dateOfBirth", fields.dateOfBirth);
  body.set("gender", fields.gender);
  if (photo) {
    body.set("avatar", photo);
  } else if (photo === null) {
    body.set("removeAvatar", "true");
  }

  const { data } = await axiosInstance.patch<AccountResponse>(profilePath, body);
  return toProfile(data);
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await axiosInstance.patch(`${profilePath}/password`, input);
}

export function accountQuery(userId: string) {
  return queryOptions({
    queryKey: ["account", userId] as const,
    queryFn: async ({ signal }) => {
      const { data } = await axiosInstance.get<AccountResponse>(profilePath, { signal });
      return toProfile(data);
    },
    retry: false,
  });
}
