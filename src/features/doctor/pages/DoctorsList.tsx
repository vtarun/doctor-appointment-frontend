import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom";
import { doctorApi } from "../api/doctor.api";
import DoctorCard from "../components/DoctorCard";
import type { Doctor } from "@/shared/types";

const DoctorsList = () => {
  const params = useParams();
  const {data: doctors, isError, isLoading, error} = useQuery({
    queryKey: ['doctors', params.speciality],
    queryFn: () => doctorApi.getDoctors(params.speciality)
  });

  if(isLoading){
    return <p>Loading doctors list...</p>
  }
  
  if(isError){
    return <p>{error.message}</p>
  }

  if(!doctors || doctors.length === 0){
    return <p>No doctors found for this specialty.</p>
  }

  

  return (
    <div>
      {doctors.map((doctor: Doctor) => {
        return <DoctorCard key={doctor._id} details={doctor}/>
      })}
    </div>
  )
}

export default DoctorsList
