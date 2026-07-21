export interface AvailabilityWindow{
    _id: string,
    doctorId: string
    startTime: string
    endTime: string
    createdAt: string
    updatedAt: string
}

export interface Slot{
    startTime: string,
    endTime: string
}

export interface AvailabilityResponse{
    availability: AvailabilityWindow[],
    slots: Slot[]
}