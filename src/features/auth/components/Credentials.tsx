import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";
import { formStyles as ui } from "@/shared/styles/formStyles";
import { specialties } from "@/features/patient/constants/specialities";

const Credentials = () => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
  } = useFormContext<OnboardingFormData>();
  const storedFile = useWatch({ control, name: "credential" });

  return (
    <section className="space-y-5" aria-labelledby="credentials-heading">
      <h2 id="credentials-heading" className="text-xl font-semibold text-ink">
        Credentials
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="speciality" className={ui.label}>Specialty</label>
          <select
            id="speciality"
            className={ui.select}
            aria-invalid={!!errors.speciality}
            aria-describedby={errors.speciality ? "speciality-error" : undefined}
            {...register("speciality")}
          >
            <option value="">Select a specialty</option>
            {specialties.map(({ slug, name }) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
          {errors.speciality && (
            <p id="speciality-error" className={ui.error}>{errors.speciality.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="qualification" className={ui.label}>Qualification</label>
          <select
            id="qualification"
            className={ui.select}
            aria-invalid={!!errors.qualification}
            aria-describedby={errors.qualification ? "qualification-error" : undefined}
            {...register("qualification")}
          >
            <option value="">Select a qualification</option>
            <option value="MBBS">MBBS</option>
            <option value="MS">MS</option>
            <option value="MD">MD</option>
          </select>
          {errors.qualification && (
            <p id="qualification-error" className={ui.error}>{errors.qualification.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="totalExperience" className={ui.label}>Experience (years)</label>
          <input
            id="totalExperience"
            type="number"
            className={ui.input}
            aria-invalid={!!errors.totalExperience}
            aria-describedby={errors.totalExperience ? "experience-error" : undefined}
            {...register("totalExperience")}
          />
          {errors.totalExperience && (
            <p id="experience-error" className={ui.error}>{errors.totalExperience.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p id="credential-label" className={ui.label}>Credential document</p>
        <p id="credential-hint" className="text-sm text-muted-ink">PDF or JPEG, under 2 MB.</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <input
            id="credential"
            type="file"
            accept=".pdf,.jpg,.jpeg"
            className="peer sr-only"
            aria-labelledby="credential-label credential-action"
            aria-describedby={errors.credential ? "credential-hint credential-error" : "credential-hint"}
            aria-invalid={!!errors.credential}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setValue("credential", file, { shouldDirty: true, shouldValidate: true });
              }
            }}
          />
          <label
            id="credential-action"
            htmlFor="credential"
            className={`${ui.secondaryButton} cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-400`}
          >
            {storedFile ? "Replace file" : "Choose file"}
          </label>
          <span className="min-w-0 wrap-anywhere text-sm text-muted-ink" aria-live="polite">
            {storedFile?.name}
          </span>
        </div>
        {errors.credential && (
          <p id="credential-error" className={ui.error}>{errors.credential.message}</p>
        )}
      </div>
    </section>
  );
};

export default Credentials;
