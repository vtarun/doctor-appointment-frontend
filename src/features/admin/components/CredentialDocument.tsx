import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getAdminDoctorErrorMessage, type DoctorCredential } from "../api/doctorApproval.api";
import { reviewFocus } from "./ApplicationReview";
import { adminCopy } from "@/features/admin/constants";

export default function CredentialDocument({ credential, load }: { credential: DoctorCredential; load?: () => Promise<Blob> }) {
  const [url, setUrl] = useState<string>();
  const document = useMutation({
    mutationFn: async () => {
      if (!load) throw new Error(adminCopy.credentialAccessUnavailable);
      const file = await load();
      if (!["application/pdf", "image/jpeg"].includes(file.type)) {
        throw new Error(adminCopy.unsupportedCredentialType);
      }
      return file;
    },
  });

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return (
    <li className="space-y-1">
      <p>{credential.name ?? adminCopy.credentialDocument}</p>
      {!load ? <p className="text-muted-ink">{adminCopy.credentialAccessMessage}</p> : url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`text-emerald-300 underline ${reviewFocus}`}>{adminCopy.openCredential}{" "}</a>
      ) : (
        <button
          className={`text-emerald-300 underline disabled:opacity-60 ${reviewFocus}`}
          disabled={document.isPending}
          onClick={() => document.mutate(undefined, {
            onSuccess: (file) => setUrl(URL.createObjectURL(file)),
          })}
        >
          {document.isPending ? adminCopy.loadingCredential : adminCopy.viewCredential}
        </button>
      )}
      {document.isError && (
        <p role="alert" className="text-red-300">{getAdminDoctorErrorMessage(document.error, adminCopy.credentialLoadError, {
          404: adminCopy.credentialUnavailable,
          410: adminCopy.credentialExpired,
        })}</p>
      )}
    </li>
  );
}
