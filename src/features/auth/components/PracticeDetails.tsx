import { useFormContext } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";

const PracticeDetails = () => {
  const { register, formState: {errors}} = useFormContext<OnboardingFormData>();
  return (
    <div>
      <h2>Practice Details</h2>
      <label htmlFor="clinicName">Clinic Name</label>
      <input id="clinicName" {...register("clinicName") } />
      {errors.clinicName && <p>{errors.clinicName.message}</p>}

      <label htmlFor="city">Date of Birth</label>
      <input id="city" {...register("city")} />
      {errors.city && <p>{errors.city.message}</p>}

      <label htmlFor="consultationType">Consultation Type</label>
      <select id="consultationType" {...register("consultationType") }>
        <option value="">Select...</option>
        <option value="ONLINE">Online</option>
        <option value="IN_PERSON">In_person</option>
        <option value="BOTH">Both</option>
      </select>
      {errors.consultationType && <p>{errors.consultationType.message}</p>}

      <label htmlFor="consultationFee">Consultation Fee</label>
      <input id="consultationFee" {...register("consultationFee")} />
      {errors.consultationFee && <p>{errors.consultationFee.message}</p>}
  </div>
  )
}

export default PracticeDetails
