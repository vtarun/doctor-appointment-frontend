import { useFormContext } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";


const Credentials = () => {  
  const { register, formState: {errors}  } = useFormContext<OnboardingFormData>();
    return (
      <div>
          <h2>Credentials</h2>
          <label htmlFor="speciality">Speciality</label>
          <input id="speciality" {...register("speciality") } />
          {errors.speciality && <p>{errors.speciality.message}</p>}
  
          <label htmlFor="totalExperience">Total Experience</label>
          <input id="totalExperience" type="number" {...register("totalExperience")} />
          {errors.totalExperience && <p>{errors.totalExperience.message}</p>}
  
          <label htmlFor="qualification">Qualification</label>
          <select id="qualification" {...register("qualification") }>
            <option value="">Select...</option>
            <option value="MBBS">MBBS</option>
            <option value="MS">MS</option>
            <option value="MD">MD</option>
            <option value="GOD">GOD Level</option>
          </select>
          {errors.qualification && <p>{errors.qualification.message}</p>}

          <label htmlFor="credential">Upload file</label>
          <input id="credential" type="file" accept=".pdf,.jpg,.jpeg" {...register("credential", {setValueAs: (files: FileList) => files?.[0]})} />
          {errors.credential && <p>{errors.credential.message as string}</p>}
      </div>
    )
}

export default Credentials
