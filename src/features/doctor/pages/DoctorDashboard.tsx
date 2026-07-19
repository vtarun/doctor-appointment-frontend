import SpecialityCard from "../components/SpecialityCard";
import { specialties } from "../constants/specialities";

const DoctorDashboard = () => {
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

export default DoctorDashboard
