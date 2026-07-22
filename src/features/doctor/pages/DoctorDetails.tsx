import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doctorApi } from "../api/doctor.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/features/availability/api/availability.api";
import type { Slot } from "@/features/availability/types";
import queryClient from "@/shared/lib/queryClient";
import { appointmentApi } from "@/features/appointments/api/appointment.api";


const DoctorDetails = () => {
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const navigate = useNavigate();
    const params = useParams();
    const {data: doctor, isLoading: isLoadingDoctor, isError: isDoctorError } = useQuery({
        queryKey: ['doctor', params.doctorId],
        queryFn: () => doctorApi.getDoctorById(params.doctorId!),
        staleTime: 30 * 60 * 1000  // 30 minutes
    });

    const {data: availabilityData, isLoading: isSlotsLoading, isError: isSlotsError } = useQuery({
        queryKey: ['slots', params.doctorId],
        queryFn: () => availabilityApi.getSlots(params.doctorId!),
        staleTime: 0  // 0 minutes - always refresh
    });

    const {mutate, isPending} = useMutation({
        mutationFn: (slot: Slot) => appointmentApi.book({
            doctorId: doctor!._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            consultationType: 'IN_PERSON'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['slots', params.doctorId]}),
            navigate('/appointments');
        },
        onError: (error) => {
            setBookingError(error.message);
        },
    });

    const bookAppointment = () => {  
        if(!selectedSlot) return;   
         mutate(selectedSlot);
    }


    if(isLoadingDoctor || isSlotsLoading){
        return <p>Loading...</p>
    }

    if(isDoctorError) return <p>Error loading doctor.</p>
    if(isSlotsError) return <p>Error loading slots.</p>

    return (
        <div>
            <section className="doctor-section">
                {/* TODO: Profile photo in future*/}
                <h2 className="title">{doctor?.userId?.name} <span>{doctor?.verificationStatus}</span> </h2>
                <h3 className="speciality">{doctor?.speciality}</h3>
                <p>Total experience: {doctor?.experienceYears}</p>
            </section>
            <section className="slot-section">
                {availabilityData?.slots.map((slot: Slot) =>(
                      <div key={slot.startTime} onClick={() => setSelectedSlot(slot)} style={{backgroundColor : selectedSlot === slot ? 'blue' : 'white'}}>
                        <p>{new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}</p>
                      </div> 
                    ))
                }
            </section>
            <button type="button" disabled={!selectedSlot || isPending} onClick={bookAppointment}>{isPending ? 'Booking...' : 'Book Appointment'}</button>
            {bookingError && <p style={{color: 'red'}}>{bookingError}</p> }
        </div>
    )
}

export default DoctorDetails
