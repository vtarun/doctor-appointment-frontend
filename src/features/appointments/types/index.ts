export interface BookAppointmentRequest{
    doctorId: string,
    startTime: string,
    endTime: string,
    consultationType: 'IN_PERSON' | 'VIDEO'
}