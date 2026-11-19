import { useState, type SubmitEvent } from "react";
import { formStyles as styles } from "@/shared/styles/formStyles";
import { registrationSchema } from "@/features/auth/schemas/registration.schema";
import { getApiErrorMessage } from "@/shared/api/apiError";
import { changePassword } from "./account.api";
import { securityCopy, passwordFields } from "./account.constant";

const emptyValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function SecurityForm() {
  const [values, setValues] = useState(emptyValues);
  const [visible, setVisible] = useState<Partial<Record<keyof typeof emptyValues, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string }>();

  const meetsRequirements = registrationSchema.in.shape.password.safeParse(values.newPassword).success;
  const reusesPassword = Boolean(values.currentPassword) && values.currentPassword === values.newPassword;
  const errors = {
    currentPassword: "",
    newPassword: reusesPassword ? securityCopy.reusedPassword :
      values.newPassword && !meetsRequirements ? securityCopy.invalidPassword : "",
    confirmPassword: values.confirmPassword && values.confirmPassword !== values.newPassword ?
      securityCopy.passwordMismatch : "",
  };
  const valid = Boolean(values.currentPassword) && meetsRequirements && !reusesPassword &&
    values.newPassword === values.confirmPassword;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setFeedback(undefined);
    try {
      await changePassword({
        currentPassword: values.currentPassword, newPassword: values.newPassword,
      });
      setValues(emptyValues);
      setVisible({});
      setFeedback({ error: false, text: securityCopy.changed });
    } catch (error) {
      setFeedback({
        error: true,
        text: getApiErrorMessage(error, securityCopy.changeError),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={submitting} className="space-y-5">
        <legend className="sr-only">{securityCopy.change}</legend>
        {passwordFields.map(({ key, label, autoComplete }) => (
          <div key={key}>
            <label htmlFor={key} className={styles.label}>{label}</label>
            <div className="flex gap-2">
              <input id={key} type={visible[key] ? "text" : "password"} required autoComplete={autoComplete}
                className={`${styles.input} min-w-0`} value={values[key]}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={[
                  key === "newPassword" ? "password-requirements" : "",
                  errors[key] ? `${key}-error` : "",
                ].filter(Boolean).join(" ") || undefined}
                onChange={(event) => setValues({ ...values, [key]: event.target.value })} />
              <button type="button" className={styles.secondaryButton}
                aria-label={`${visible[key] ? securityCopy.hide : securityCopy.show} ${label.toLowerCase()}`}
                aria-controls={key}
                onClick={() => setVisible({ ...visible, [key]: !visible[key] })}>
                {visible[key] ? securityCopy.hide : securityCopy.show}
              </button>
            </div>
            {errors[key] && <p id={`${key}-error`} className={styles.error}>{errors[key]}</p>}
            {key === "newPassword" && <p id="password-requirements" className="mt-1 text-sm text-muted-ink">
              {securityCopy.requirements}
            </p>}
          </div>
        ))}
        <button type="submit" className={styles.primaryButton} disabled={!valid}>
          {submitting ? securityCopy.changing : securityCopy.change}
        </button>
      </fieldset>
      <p role="status" className={styles.success}>{submitting ? securityCopy.changingStatus : !feedback?.error && feedback?.text}</p>
      {feedback?.error && <p role="alert" className={styles.error}>{feedback.text}</p>}
    </form>
  );
}
