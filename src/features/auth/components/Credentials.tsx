import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingFormData } from "../schemas/onboarding.schema";
import { formStyles as ui } from "@/shared/styles/formStyles";


const Credentials = () => {  
  const { control, register, formState: {errors}, setValue  } = useFormContext<OnboardingFormData>();
  const storedFile = useWatch({ control, name: 'credential' });
    return (
      <div  className="space-y-5">
          <h2  className="text-xl font-semibold text-ink">Credentials</h2>
          <label htmlFor="speciality" className={ui.label} >Speciality</label>
          <input id="speciality" className={ui.input} {...register("speciality") } />
          {errors.speciality && <p className={ui.error}>{errors.speciality.message}</p>}
  
          <label htmlFor="totalExperience"  className={ui.label} >Total Experience</label>
          <input id="totalExperience" type="number"  className={ui.input}  {...register("totalExperience")} />
          {errors.totalExperience && <p className={ui.error}>{errors.totalExperience.message}</p>}
  
          <label htmlFor="qualification" className={ui.label} >Qualification</label>
          <select id="qualification"  className={ui.input} {...register("qualification") }>
            <option value="">Select...</option>
            <option value="MBBS">MBBS</option>
            <option value="MS">MS</option>
            <option value="MD">MD</option>
          </select>
          {errors.qualification && <p className={ui.error}>{errors.qualification.message}</p>}

          <label htmlFor="credential"  className={ui.label} >Upload file</label>
          {/* <input id="credential" type="file" accept=".pdf,.jpg,.jpeg" {...register("credential", {setValueAs: (files: FileList) => files?.[0]})} /> */}
          <input
            id="credential"
            type="file"
            accept=".pdf,.jpg,.jpeg"
            className={ui.input} 
            onChange={(e) => {
              const file = e.target.files?.[0]
              if(file) setValue('credential', file, { shouldDirty: true, shouldValidate: true })
            }}
          />

          {storedFile && (<p  className={ui.label} >Selected: {storedFile.name}</p> )}
          {errors.credential && <p  className={ui.error} >{errors.credential.message as string}</p>}
      </div>
    )
}

export default Credentials
