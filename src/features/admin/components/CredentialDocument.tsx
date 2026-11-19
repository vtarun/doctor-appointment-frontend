import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getAdminDoctorErrorMessage, type DoctorCredential } from "../api/doctorApproval.api";
import { reviewFocus } from "./ApplicationReview";

export default function CredentialDocument({ credential, load }: { credential: DoctorCredential; load?: () => Promise<Blob> }) {
  const [url, setUrl] = useState<string>();
  const document = useMutation({
    mutationFn: async () => {
      if (!load) throw new Error("Credential access unavailable");
      const file = await load();
      if (!["application/pdf", "image/jpeg"].includes(file.type)) {
        throw new Error("Unsupported credential type");
      }
      return file;
    },
  });

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return (
    <li className="space-y-1">
      <p>{credential.name ?? "Credential document"}</p>
      {!load ? <p className="text-muted-ink">Secure document access is currently unavailable.</p> : url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`text-emerald-300 underline ${reviewFocus}`}>
          Open credential (new tab)
        </a>
      ) : (
        <button
          className={`text-emerald-300 underline disabled:opacity-60 ${reviewFocus}`}
          disabled={document.isPending}
          onClick={() => document.mutate(undefined, {
            onSuccess: (file) => setUrl(URL.createObjectURL(file)),
          })}
        >
          {document.isPending ? "Loading credential…" : "View credential"}
        </button>
      )}
      {document.isError && (
        <p role="alert" className="text-red-300">{getAdminDoctorErrorMessage(document.error, "Could not open this credential.", {
          404: "This credential is unavailable.",
          410: "Access to this credential has expired.",
        })}</p>
      )}
    </li>
  );
}
