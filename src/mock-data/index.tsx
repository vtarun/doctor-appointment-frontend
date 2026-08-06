export const mockAppointments = [
  {
    // TEST CASE: "Join Video" should be VISIBLE (Starts within 30 mins)
    _id: "apt_001",
    status: "BOOKED",
    consultationType: "VIDEO",
    // Set to roughly 15 minutes ahead of Aug 5, 2026, 5:53 PM IST
    startTime: "2026-08-05T18:08:00+05:30", 
    endTime: "2026-08-05T18:38:00+05:30",
    doctorId: {
      speciality: "Cardiologist",
      userId: { name: "Dr. Arvind Mehta" }
    }
  },
  {
    // TEST CASE: "Join Video" HIDDEN (Future video, beyond 30 mins)
    _id: "apt_002",
    status: "BOOKED",
    consultationType: "VIDEO",
    startTime: "2026-08-06T10:00:00+05:30",
    endTime: "2026-08-06T10:30:00+05:30",
    doctorId: {
      speciality: "Dermatologist",
      userId: { name: "Dr. Sunita Sharma" }
    }
  },
  {
    // TEST CASE: "Join Video" HIDDEN (It is an IN_PERSON appointment)
    _id: "apt_003",
    status: "BOOKED",
    consultationType: "IN_PERSON",
    startTime: "2026-08-05T18:15:00+05:30", // Within 30 mins, but not video
    endTime: "2026-08-05T18:45:00+05:30",
    doctorId: {
      speciality: "General Physician",
      userId: { name: "Dr. Rohan Gupta" }
    }
  },
  {
    // TEST CASE: Past appointment (Completed)
    _id: "apt_004",
    status: "COMPLETED",
    consultationType: "VIDEO",
    startTime: "2026-08-01T14:00:00+05:30",
    endTime: "2026-08-01T14:30:00+05:30",
    doctorId: {
      speciality: "Neurologist",
      userId: { name: "Dr. Vikram Singh" }
    }
  },
  {
    // TEST CASE: Cancelled appointment
    _id: "apt_005",
    status: "CANCELLED",
    consultationType: "IN_PERSON",
    startTime: "2026-08-07T09:30:00+05:30",
    endTime: "2026-08-07T10:00:00+05:30",
    doctorId: {
      speciality: "Orthopedic",
      userId: { name: "Dr. Anjali Desai" }
    }
  },
  {
    // TEST CASE: Far future BOOKED video
    _id: "apt_006",
    status: "BOOKED",
    consultationType: "VIDEO",
    startTime: "2026-08-15T11:00:00+05:30",
    endTime: "2026-08-15T11:45:00+05:30",
    doctorId: {
      speciality: "Psychiatrist",
      userId: { name: "Dr. Kabir Das" }
    }
  },
  {
    // TEST CASE: Past completed IN_PERSON
    _id: "apt_007",
    status: "COMPLETED",
    consultationType: "IN_PERSON",
    startTime: "2026-07-28T16:00:00+05:30",
    endTime: "2026-07-28T16:30:00+05:30",
    doctorId: {
      speciality: "Pediatrician",
      userId: { name: "Dr. Meera Patel" }
    }
  },
  {
    // TEST CASE: Cancelled video (Past)
    _id: "apt_008",
    status: "CANCELLED",
    consultationType: "VIDEO",
    startTime: "2026-08-02T12:00:00+05:30",
    endTime: "2026-08-02T12:30:00+05:30",
    doctorId: {
      speciality: "Endocrinologist",
      userId: { name: "Dr. Sanjay Verma" }
    }
  },
  {
    // TEST CASE: Booked future IN_PERSON
    _id: "apt_009",
    status: "BOOKED",
    consultationType: "IN_PERSON",
    startTime: "2026-08-10T15:00:00+05:30",
    endTime: "2026-08-10T15:30:00+05:30",
    doctorId: {
      speciality: "ENT Specialist",
      userId: { name: "Dr. Priya Kapoor" }
    }
  },
  {
    // TEST CASE: "Join Video" HIDDEN (Started in the past, but less than 30 mins diff)
    // Note: diff > 0 check in your code handles this, preventing joining a past-due call
    _id: "apt_010",
    status: "BOOKED",
    consultationType: "VIDEO",
    startTime: "2026-08-05T17:00:00+05:30", 
    endTime: "2026-08-05T17:30:00+05:30",
    doctorId: {
      speciality: "Oncologist",
      userId: { name: "Dr. Neha Iyer" }
    }
  }
];