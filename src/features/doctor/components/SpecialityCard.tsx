import { Link } from "react-router-dom"
import type { Speciality } from "../types"

interface SpecialityCardProps{
  speciality: Speciality
}

const SpecialityCard = ({speciality: {name, slug, icon}}: SpecialityCardProps) => {
  return (
    <div>
      <span>{icon}</span>
      <Link to={`/doctors/${slug}`}>{name}</Link>
    </div>
  )
}

export default SpecialityCard
