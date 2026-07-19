import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";


const Credentials = () => {  
  const { control, register, formState: {errors}, setValue  } = useFormContext<OnboardingFormData>();
  const storedFile = useWatch({ control, name: 'credential' });
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
          {/* <input id="credential" type="file" accept=".pdf,.jpg,.jpeg" {...register("credential", {setValueAs: (files: FileList) => files?.[0]})} /> */}
          <input
            id="credential"
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if(file) setValue('credential', file as File, { shouldValidate: true })
            }}
          />

          {storedFile && (<p>Selected: {storedFile.name}</p> )}
          {errors.credential && <p>{errors.credential.message as string}</p>}
      </div>
    )
}

export default Credentials
