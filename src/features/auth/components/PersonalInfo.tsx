import { useAuthStore } from "@/shared/store/authStore";
import { useFormContext } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";

const PersonalInfo = () => {
  const { register, formState: {errors} } = useFormContext<OnboardingFormData>();
  const { user } = useAuthStore();
  return (
    <div>
        <h2>Personal Info</h2>
        <label htmlFor="fullname">Full Name</label>
        <input id="fullname" {...register("fullname")} />
        {errors.fullname && <p>{errors.fullname.message}</p>}

        <label htmlFor="dob">Date of Birth</label>
        <input id="dob" type="date" {...register("dateOfBirth")} />
        {errors.dateOfBirth && <p>{errors.dateOfBirth.message}</p>}

        <label htmlFor="gender">Gender</label>
        <select id="gender" {...register("gender")} >
          <option value="">Select...</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.gender && <p>{errors.gender.message}</p>}
    </div>
  )
}

export default PersonalInfo
