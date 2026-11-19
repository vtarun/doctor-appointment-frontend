import { useEffect, useState, type SubmitEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { getApiErrorMessage } from "@/shared/api/apiError";
import Avatar from "@/shared/components/Avatar";
import { formStyles as styles } from "@/shared/styles/formStyles";
import { accountQuery, saveProfile, type AccountProfile, type ProfileFields } from "./account.api";
import { profileCopy, genderLabels, genders, avatarTypes, avatarMaxBytes } from "./account.constant";

const dateSchema = z.iso.date();

function localDateString(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return [date.getFullYear(), month, day].join("-");
}

export default function ProfileForm({ saved, userId }: { saved: AccountProfile; userId: string }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ProfileFields>();
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>();
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string }>();
  const fields = draft ?? saved;
  const today = localDateString();
  const name = fields.name.trim();
  const validDate = dateSchema.safeParse(fields.dateOfBirth).success &&
    fields.dateOfBirth >= "0001-01-01" && fields.dateOfBirth <= today;
  const validGender = genders.some((gender) => gender === fields.gender);
  const dirty = name !== saved.name || fields.dateOfBirth !== saved.dateOfBirth ||
    fields.gender !== saved.gender || photo !== undefined || Boolean(photoError);
  const avatar = photo === undefined ? saved.avatarUrl : photo?.url;

  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  function choosePhoto(file?: File) {
    if (!file) return;
    setFeedback(undefined);
    if (!avatarTypes.includes(file.type) || file.size === 0 || file.size > avatarMaxBytes) {
      setPhotoError(profileCopy.invalidPhoto);
      return;
    }
    setPhotoError("");
    setPhoto({ file, url: URL.createObjectURL(file) });
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || !name || !validDate || !validGender || photoError || saving) return;
    const queryKey = accountQuery(userId).queryKey;
    const filters = { queryKey, exact: true };
    const cache = queryClient.getQueryCache();
    const account = cache.find(filters);
    setSaving(true);
    setFeedback(undefined);
    try {
      const result = await saveProfile({
        fields: { name, dateOfBirth: fields.dateOfBirth, gender: fields.gender },
        photo: photo && photo.file,
      });
      // A logout can clear the cache while the request is in flight.
      if (!account || cache.find(filters) !== account) return;
      await queryClient.cancelQueries(filters);
      if (cache.find(filters) !== account) return;
      queryClient.setQueryData(queryKey, result);
      setDraft(undefined);
      setPhoto(undefined);
      setFeedback({ error: false, text: profileCopy.saved });
    } catch (error) {
      setFeedback({
        error: true,
        text: getApiErrorMessage(error, profileCopy.saveError, {
          413: profileCopy.photoTooLarge,
          415: profileCopy.unsupportedPhoto,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={saving} className="space-y-5">
        <legend className="sr-only">{profileCopy.legend}</legend>
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={name || saved.name} src={avatar} className="size-16 text-xl" />
          <div className="min-w-0 flex-1 basis-48">
            <label htmlFor="account-photo" className={styles.label}>
              {avatar || photo ? profileCopy.replacePhoto : profileCopy.choosePhoto}
            </label>
            <input id="account-photo" type="file" accept={avatarTypes.join(",")} className={styles.file}
              aria-describedby={photoError ? "photo-hint photo-error" : "photo-hint"}
              aria-invalid={Boolean(photoError)}
              onChange={(event) => {
                choosePhoto(event.target.files?.[0]);
                event.target.value = "";
              }} />
            <p id="photo-hint" className="mt-1 text-sm text-muted-ink">{profileCopy.photoHint}</p>
            {photoError && <p id="photo-error" className={styles.error} role="alert">{photoError}</p>}
            {(avatar || photo) && <button type="button" className={`${styles.secondaryButton} mt-2`} onClick={() => {
              setPhoto(saved.avatarUrl ? null : undefined);
              setPhotoError("");
              setFeedback(undefined);
            }}>{profileCopy.removePhoto}</button>}
          </div>
        </div>
        <div>
          <label htmlFor="account-name" className={styles.label}>{profileCopy.name}</label>
          <input id="account-name" autoComplete="name" required className={styles.input} value={fields.name}
            aria-invalid={!name} aria-describedby={!name ? "name-error" : undefined}
            onChange={(event) => setDraft({ ...fields, name: event.target.value })} />
          {!name && <p id="name-error" className={styles.error}>{profileCopy.nameRequired}</p>}
        </div>
        <div>
          <label htmlFor="account-email" className={styles.label}>{profileCopy.email}</label>
          <input id="account-email" type="email" readOnly className={styles.input} value={saved.email} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="account-birth" className={styles.label}>{profileCopy.dateOfBirth}</label>
            <input id="account-birth" type="date" autoComplete="bday" required min="0001-01-01" max={today}
              className={styles.input} value={fields.dateOfBirth}
              aria-invalid={!validDate} aria-describedby={!validDate ? "birth-error" : undefined}
              onChange={(event) => setDraft({ ...fields, dateOfBirth: event.target.value })} />
            {!validDate && <p id="birth-error" className={styles.error}>{profileCopy.invalidDate}</p>}
          </div>
          <div>
            <label htmlFor="account-gender" className={styles.label}>{profileCopy.gender}</label>
            <select id="account-gender" required className={styles.select} value={validGender ? fields.gender : ""}
              aria-invalid={!validGender} aria-describedby={!validGender ? "gender-error" : undefined}
              onChange={(event) => setDraft({ ...fields, gender: event.target.value })}>
              <option value="">{profileCopy.genderPlaceholder}</option>
              {genders.map((gender) => <option key={gender} value={gender}>{genderLabels[gender]}</option>)}
            </select>
            {!validGender && <p id="gender-error" className={styles.error}>{profileCopy.genderRequired}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={styles.primaryButton}
            disabled={!dirty || !name || !validDate || !validGender || Boolean(photoError)}>
            {saving ? profileCopy.saving : profileCopy.save}
          </button>
          <button type="button" className={styles.secondaryButton} disabled={!dirty} onClick={() => {
            setDraft(undefined);
            setPhoto(undefined);
            setPhotoError("");
            setFeedback(undefined);
          }}>{profileCopy.cancel}</button>
        </div>
      </fieldset>
      <p role="status" className={styles.success}>{saving ? profileCopy.savingStatus : !feedback?.error && feedback?.text}</p>
      {feedback?.error && <p role="alert" className={styles.error}>{feedback.text}</p>}
    </form>
  );
}
