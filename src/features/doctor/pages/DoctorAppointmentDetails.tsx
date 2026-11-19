import { Link, useParams } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import AppointmentDetailsView from "@/features/appointments/components/AppointmentDetailsView";
import { appointmentCopy } from "@/features/appointments/constants";

export default function DoctorAppointmentDetails() {
  const { appointmentId = "" } = useParams();
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <Link className="text-emerald-300 underline" to={ROUTES.doctor.root}>{appointmentCopy.backToDashboard}</Link>
      <h1 className="text-3xl font-semibold">{appointmentCopy.title}</h1>
      <div className="rounded-xl border border-line bg-panel p-5">
        <AppointmentDetailsView appointmentId={appointmentId} role="DOCTOR" />
      </div>
    </div>
  );
}
