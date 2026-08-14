import type { DoctorAppointment } from "@/features/doctor/types"
import { calculateAge, formatConsultationType, formatTime } from "@/shared/utils";
import { useNavigate } from "react-router-dom";

interface DoctorAppointmentCardProps{
  appointment: DoctorAppointment, 
  now: number,
  cancel: () => void, 
  complete: () => void,
  isCancelling: boolean,  
  isCompleting: boolean,
  completeError: string
  cancelError: string
}
const DoctorAppointmentCard = ({appointment, now, cancel, complete, isCancelling, isCompleting, completeError, cancelError}: DoctorAppointmentCardProps) => {
  const navigate = useNavigate();

  const startTime = new Date(appointment.startTime).getTime();
  const endTime = new Date(appointment.endTime).getTime();

  const joinWindowStart = startTime - 30 * 60 * 1000;
  const cancellationDeadline = startTime - 30 * 60 * 1000;

  const canJoin =
    appointment.status === "BOOKED" &&
    appointment.consultationType === "VIDEO" &&
    now >= joinWindowStart &&
    now < endTime;

  const canCancel = 
    appointment.status === "BOOKED" &&
    now < cancellationDeadline;

  const canComplete =
    appointment.status === "BOOKED" &&
    now >= endTime;

  const patientAge = appointment.patientId.dateOfBirth ? calculateAge(appointment.patientId.dateOfBirth) : undefined;

  const handleJoinVideo = () => {
    navigate(
      `/video-call?appointmentId=${encodeURIComponent(appointment._id)}`
    );
  };

  return (
    <article className="doctor-appointment-card card">
      <header className="appointment-card-header">
        <div className="patient-summary">
          {appointment.patientId.profileImageUrl ? (
            <img
              src={appointment.patientId.profileImageUrl}
              alt={`${appointment.patientId.userId.name}'s profile`}
            />
          ) : (
            <div aria-hidden="true" className="patient-avatar-placeholder">
              {appointment.patientId.userId.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h3>{appointment.patientId.userId.name}</h3>

            {(patientAge !== undefined ||
              appointment.patientId.gender !== undefined) && (
              <p>
                {patientAge !== undefined && `${patientAge} years`}

                {patientAge !== undefined &&
                  appointment.patientId.gender &&
                  " · "}

                {appointment.patientId.gender}
              </p>
            )}
          </div>
        </div>

        <span className={`status status-${appointment.status.toLowerCase()}`}>
          {appointment.status}
        </span>
      </header>

      <div className="appointment-details">
        <p>
          <strong>Consultation:</strong>{" "}
          {formatConsultationType(appointment.consultationType)}
        </p>

        <p>
          <strong>Time:</strong>{" "}
          <time dateTime={appointment.startTime}>
            {formatTime(appointment.startTime)}
          </time>
          {" – "}
          <time dateTime={appointment.endTime}>
            {formatTime(appointment.endTime)}
          </time>
        </p>

        {appointment.issueNote && (
          <div className="appointment-issue">
            <h4>Reason for appointment</h4>
            <p>{appointment.issueNote}</p>
          </div>
        )}

        {appointment.doctorNotes && (
          <div className="doctor-notes">
            <h4>Consultation notes</h4>
            <p>{appointment.doctorNotes}</p>
          </div>
        )}
      </div>

      {appointment.status === "BOOKED" && (
        <div className="appointment-actions">
          {canJoin && (
            <button type="button" onClick={handleJoinVideo}>
              Join video
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={cancel}
              disabled={isCancelling || isCompleting}
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}

          {canComplete && (
            <button
              type="button"
              onClick={complete}
              disabled={isCompleting || isCancelling}
            >
              {isCompleting ? "Completing..." : "Complete"}
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default DoctorAppointmentCard
