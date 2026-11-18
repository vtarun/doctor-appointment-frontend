import { useFormContext } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";
import { formStyles as ui } from "@/shared/styles/formStyles";

const PersonalInfo = () => {
  const { register, formState: {errors} } = useFormContext<OnboardingFormData>();  
  return (
    <div className="space-y-5">
        <h2 className="text-xl font-semibold text-ink">Personal Info</h2>

        <div>
          <label htmlFor="fullname" className={ui.label} >Full Name</label>
          <input id="fullname" className={ui.input}  {...register("fullname")} />
          {errors.fullname && <p className={ui.error}  >{errors.fullname.message}</p>}
        </div>

        <div>
          <label htmlFor="dob" className={ui.label} >Date of Birth</label>
          <input id="dob" type="date" className={ui.input}   {...register("dateOfBirth")} />
          {errors.dateOfBirth && <p className={ui.error}  >{errors.dateOfBirth.message}</p>}
        </div>

        <div>
          <label htmlFor="gender" className={ui.label} >Gender</label>
          <select id="gender" className={ui.input}   {...register("gender")} >
            <option value="">Select...</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender && <p className={ui.error}  >{errors.gender.message}</p>}
        </div>
    </div>
  )
}

export default PersonalInfo
