import { useState } from "react";

interface AvatarProps {
  name: string;
  src?: string | null;
  className: string;
}

export default function Avatar({ name, src, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase()).join("") || "?";

  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-900 font-semibold text-emerald-100 ${className}`}>
      {src && src !== failedSrc ? (
        <img src={src} alt="" className="size-full object-cover" onError={() => setFailedSrc(src)} />
      ) : initials}
    </span>
  );
}
