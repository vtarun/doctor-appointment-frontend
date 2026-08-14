interface DoctorRejectedStatusProps{
    reason: string
}
const DoctorRejectedStatus = ({reason}: DoctorRejectedStatusProps) => {
  return (
      <section className="card">
        <h1>Verification rejected</h1>
        <p>
          Your doctor profile could not be verified.
        </p>

        {reason && (
          <p>
            <strong>Reason:</strong> {reason}
          </p>
        )}
      </section>
    );
}

export default DoctorRejectedStatus

