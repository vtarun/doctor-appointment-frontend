import type { Appointment } from "@/shared/types";
import { useNavigate } from "react-router-dom";

interface AppointmentCardProps{
  appointment: Appointment;
  cancel: (appointmentId: string) => void

}

const AppointmentCard = ({appointment, cancel}: AppointmentCardProps) => {

  const navigate = useNavigate();

  const handleJoinVideo = (appointmentId: string) => {        
    navigate(`/video-call?appointmentId=${appointmentId}`);
  }

  

  const isVideoEnabled = (appointment: Appointment) => {

    if(appointment.status !== 'BOOKED') return false;

    const currentTime = new Date().getTime();
    const startTime = new Date(appointment.startTime).getTime();
    const diff = startTime - currentTime
    if(diff > 0 && diff <= 30 * 60 * 1000 ){
      return true;
    }
  };

  return (
    <div>


      <div>
        <h3>{appointment?.doctorId.userId?.name}<span>{appointment?.status}</span></h3>
        <h4>{appointment?.doctorId?.speciality}</h4>
        <div>
          <p>{new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString() } </p>
          <div>
          { appointment.consultationType === 'VIDEO' && isVideoEnabled(appointment) && <button onClick={() => handleJoinVideo(appointment?._id)}>Join video</button>}
          { appointment.status === 'BOOKED' ? <button onClick={() => cancel(appointment._id)}>Cancel</button> : ''}
          </div>
        </div>
      </div>  

    </div>
  )
}

export default AppointmentCard
