import type { DoctorAppointment } from "@/features/doctor/types"
import { calculateAge, formatConsultationType, formatTime } from "@/shared/utils";
import { generatePath, Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import JoinVideo from "./JoinVideo";
import { appointmentCopy } from "@/features/appointments/constants";

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


  const startTime = new Date(appointment.startTime).getTime();
  const endTime = new Date(appointment.endTime).getTime();


  const cancellationDeadline = startTime - 30 * 60 * 1000;



  const canCancel = 
    appointment.status === "BOOKED" &&
    now < cancellationDeadline;

  const canComplete =
    appointment.status === "BOOKED" &&
    now >= endTime;

  const patientAge = appointment.patientId.dateOfBirth ? calculateAge(appointment.patientId.dateOfBirth) : undefined;



  return (
    <article className="doctor-appointment-card card">
      <header className="appointment-card-header">
        <div className="patient-summary">
          {appointment.patientId.profileImageUrl ? (
            <img
              src={appointment.patientId.profileImageUrl}
              alt={appointmentCopy.patientPhotoAlt(appointment.patientId.userId.name)}
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
                {patientAge !== undefined && appointmentCopy.patientAge(patientAge)}

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
          <strong>{appointmentCopy.consultationLabel}</strong>{" "}
          {formatConsultationType(appointment.consultationType)}
        </p>

        <p>
          <strong>{appointmentCopy.timeLabel}</strong>{" "}
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
            <h4>{appointmentCopy.reason}</h4>
            <p>{appointment.issueNote}</p>
          </div>
        )}

        {appointment.doctorNotes && (
          <div className="doctor-notes">
            <h4>{appointmentCopy.consultationNotes}</h4>
            <p>{appointment.doctorNotes}</p>
          </div>
        )}
      </div>

      {completeError && <p role="alert">{completeError}</p>}
      {cancelError && <p role="alert">{cancelError}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <Link className="text-emerald-300 underline" to={generatePath(ROUTES.doctor.appointmentDetails, { appointmentId: appointment._id })}>{appointmentCopy.viewDetails}</Link>
        <JoinVideo appointment={appointment} />
      </div>
      {appointment.status === "BOOKED" && (
        <div className="appointment-actions">


          {canCancel && (
            <button
              type="button"
              onClick={cancel}
              disabled={isCancelling || isCompleting}
            >
              {isCancelling ? appointmentCopy.cancelling : appointmentCopy.cancel}
            </button>
          )}

          {canComplete && (
            <button
              type="button"
              onClick={complete}
              disabled={isCompleting || isCancelling}
            >
              {isCompleting ? appointmentCopy.completing : appointmentCopy.complete}
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default DoctorAppointmentCard
