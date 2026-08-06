import type { Appointment } from "@/shared/types";
import { useNavigate } from "react-router-dom";

interface AppointmentCardProps{
  appointment: Appointment;
  cancel: () => void,
  isCancelling: boolean

}

const AppointmentCard = ({appointment, cancel, isCancelling}: AppointmentCardProps) => {

  const navigate = useNavigate();

  const handleJoinVideo = () => {        
    navigate(`/video-call?appointmentId=${encodeURIComponent(appointment._id)}`);
  }
  const isVideoEnabled = (appointment: Appointment) => {

    if(appointment.status !== 'BOOKED' || appointment.consultationType !== 'VIDEO') return false;

    const currentTime = new Date().getTime();
    const startTime = new Date(appointment.startTime).getTime();
    const diff = startTime - currentTime
    if(diff > 0 && diff <= 30 * 60 * 1000 ){
      return true;
    }
  };

  return (
    <article>


      <header>
        <h3>{appointment?.doctorId.userId?.name}</h3>
        <span>{appointment?.status}</span>
      </header>

      <p>{appointment?.doctorId?.speciality}</p>
        
      <time dateTime={appointment.startTime}>
        {new Date(appointment.startTime).toLocaleTimeString()}
      </time> 
      <span>
        {" - "}
        {new Date(appointment.endTime).toLocaleTimeString() } 
      </span>
          
      <div>
          {  isVideoEnabled(appointment) && (
            <button 
              type="button" 
              onClick={handleJoinVideo}>
                Join video
            </button>

          )}

          { appointment.status === 'BOOKED' &&(
            <button 
              type="button"
              disabled={isCancelling}
              onClick={cancel}>
                { isCancelling ? 'Cancelling...' : 'Cancel' }
            </button> 
          )}
      </div>

    </article>
  )
}

export default AppointmentCard
