import SpecialityCard from "@/features/patient/components/SpecialityCard";
import { specialties } from "@/features/patient/constants/specialities";

const FindDoctors = () => {
  return (
    <div>
      { 
        specialties.map( 
          (speciality) =>  <SpecialityCard key={speciality.slug} speciality={speciality} /> 
        )
      }
    </div>
  )
}

export default FindDoctors
