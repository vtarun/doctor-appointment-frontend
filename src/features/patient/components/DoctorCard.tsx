import type { Doctor } from "@/shared/types"

interface DoctorCardProps{
  details: Doctor
}

const DoctorCard = ({details}: DoctorCardProps) => {
  return (
    <div className="card-container">
      <div><img src="" alt="doctor's image"/></div>{ /* TODO: For future implementation */}
      <h2 className="title">{details.userId.name}</h2>
      <h3 className="speciality">{details.speciality}</h3>
      <p>Total experience: {details.experienceYears}</p>
    </div>
  )
}

export default DoctorCard
