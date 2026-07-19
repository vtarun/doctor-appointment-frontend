import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";

interface ReviewAndSubmitProps {
  onEditSteps: (step: number) => void;
}
const ReviewAndSubmit = ({onEditSteps}: ReviewAndSubmitProps) => {
  const { control, formState: {isSubmitting} } = useFormContext<OnboardingFormData>();
  const { fullname,
    dateOfBirth,
    gender,
    speciality,
    totalExperience,
    qualification,
    credential,
    clinicName,
    city,
    consultationType,
    consultationFee} = useWatch({ control });

  return (<div>
    <h2>Review Details</h2>
    <section>
      <h3>Personal Info</h3>
      <p>Full name : <b>{fullname}</b></p>
      <p>Date of birth : <b>{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : '-'}</b></p>
      <p>Gender : <b>{gender}</b></p>
      <button
          type="button"
          onClick={() => onEditSteps(1)}
        >
          Edit
        </button>
    </section> 

    <section>
      <h3>Credentials</h3>
      <p>Speciality : <b>{speciality}</b></p>
      <p>Total experience : <b>{totalExperience}</b></p>
      <p>Qualification : <b>{qualification}</b></p>
      <p>File: {credential?.name ?? 'No file uploaded'}</p>

      <button
          type="button"
          onClick={() => onEditSteps(2)}
        >
          Edit
        </button>
    </section> 

     <section>
      <h3>Practice details</h3>
      <p>Clinic name : <b>{clinicName}</b></p>
      <p>City : <b>{city}</b></p>
      <p>Consultation type : <b>{consultationType}</b></p>
      <p>Consultation fee: {consultationFee}</p>

      <button
          type="button"
          onClick={() => onEditSteps(3)}
        >
          Edit
        </button>
    </section> 

    <div><button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button></div>   
  </div>)
}


export default ReviewAndSubmit;
