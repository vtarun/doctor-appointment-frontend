// import { mockDoctorAppointments } from "@/features/doctor/mock-data";
// import type { DoctorAppointment } from "@/features/doctor/types";
// import { mockPatientAppointments } from "@/mock-data";
import { useQuery } from "@tanstack/react-query";
import { appointmentApi } from "../api/appointment.api";

export const useAppointments = () => {
    const {data: originalAppointmentList, isError: isAppointmentsError, isLoading: isAppointmentLoading} = useQuery({
        queryKey: ['appointments/me'],
        queryFn: () => appointmentApi.getAllAppointments(),
    });

    return {originalAppointmentList, isAppointmentsError, isAppointmentLoading};
}










// import { doctorRepository } from "../repositories/doctor.respository";
// import { AppError } from "../utils/appError";
// import { availabilitRepository } from "../repositories/availability.repository";
// import { appointmentRepository } from "../repositories/appointment.repository";
// import { generateSlots } from "../utils/slotGenerator";

// const APPOINTMENT_DURATION_MINUTES = 30;
// const APPOINTMENT_DURATION_MS = APPOINTMENT_DURATION_MINUTES * 60 * 1000;
// const MAX_READ_RANGE_MS = 7 * 24 * 60 * 60 * 1000;

// type AvailabilityInput = { startTime: string; endTime: string };
// type NormalisedWindow = {
//     startTime: Date;
//     endTime: Date;
//     requestedEndTime: Date;
//     excludedMinutes: number;
// };

// function parseDate(value: string, field: string){
//     const parsed = new Date(value);
//     if(Number.isNaN(parsed.getTime())){
//         throw new AppError(`${field} must be a valid ISO datetime`, 400);
//     }
//     return parsed;
// }

// function isSlotBoundary(date: Date){
//     return date.getUTCSeconds() === 0
//         && date.getUTCMilliseconds() === 0
//         && date.getUTCMinutes() % APPOINTMENT_DURATION_MINUTES === 0;
// }

// function normaliseWindow(input: AvailabilityInput, now = new Date()): NormalisedWindow {
//     const startTime = parseDate(input.startTime, 'startTime');
//     const requestedEndTime = parseDate(input.endTime, 'endTime');

//     if(startTime >= requestedEndTime){
//         throw new AppError('startTime must be before endTime', 400);
//     }
//     if(startTime < now){
//         throw new AppError('Availability must be in the future', 400);
//     }
//     if(!isSlotBoundary(startTime)){
//         throw new AppError('startTime must be on a 30-minute boundary', 400);
//     }

//     const submittedDurationMs = requestedEndTime.getTime() - startTime.getTime();
//     const completeSlotCount = Math.floor(submittedDurationMs / APPOINTMENT_DURATION_MS);
//     if(completeSlotCount < 1){
//         throw new AppError('Availability must contain at least one complete 30-minute appointment', 400);
//     }

//     const endTime = new Date(startTime.getTime() + completeSlotCount * APPOINTMENT_DURATION_MS);
//     const excludedMinutes = Math.floor((requestedEndTime.getTime() - endTime.getTime()) / 60000);
//     return { startTime, endTime, requestedEndTime, excludedMinutes };
// }

// function mergeSubmittedWindows(windows: NormalisedWindow[]){
//     const sorted = [...windows].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
//     const merged: NormalisedWindow[] = [];

//     for(const current of sorted){
//         const previous = merged[merged.length - 1];
//         if(!previous || current.startTime > previous.endTime){
//             merged.push({...current});
//             continue;
//         }
//         if(current.endTime > previous.endTime) previous.endTime = current.endTime;
//         if(current.requestedEndTime > previous.requestedEndTime){
//             previous.requestedEndTime = current.requestedEndTime;
//         }
//         previous.excludedMinutes += current.excludedMinutes;
//     }
//     return merged;
// }

// async function requireVerifiedDoctor(userId: string){
//     const doctor = await doctorRepository.findByUserId(userId);
//     if(!doctor) throw new AppError('Doctor profile not found', 404);
//     if(doctor.verificationStatus !== 'VERIFIED') throw new AppError('Doctor not verified', 403);
//     return doctor;
// }

// async function mergeWithStoredWindows(doctorId: string, submitted: NormalisedWindow){
//     const existing = await availabilitRepository.findOverlappingOrAdjacent(
//         doctorId, submitted.startTime, submitted.endTime
//     );
//     const mergedStart = new Date(Math.min(
//         submitted.startTime.getTime(),
//         ...existing.map(window => window.startTime.getTime())
//     ));
//     const mergedEnd = new Date(Math.max(
//         submitted.endTime.getTime(),
//         ...existing.map(window => window.endTime.getTime())
//     ));

//     const saved = await availabilitRepository.replaceWindows(
//         doctorId,
//         existing.map(window => window._id.toString()),
//         [{startTime: mergedStart, endTime: mergedEnd}]
//     );

//     return {
//         availability: saved[0],
//         normalization: {
//             requestedEndTime: submitted.requestedEndTime,
//             savedEndTime: submitted.endTime,
//             excludedMinutes: submitted.excludedMinutes
//         }
//     };
// }

// export const availabilityService = {
//     async createAvailability(userId: string, data: AvailabilityInput) {
//         const doctor = await requireVerifiedDoctor(userId);
//         return mergeWithStoredWindows(doctor._id.toString(), normaliseWindow(data));
//     },

//     async createBulkAvailability(userId: string, windows: AvailabilityInput[]){
//         const doctor = await requireVerifiedDoctor(userId);
//         const now = new Date();
//         const normalised = mergeSubmittedWindows(windows.map(window => normaliseWindow(window, now)));
//         const results = [];
//         for(const window of normalised){
//             results.push(await mergeWithStoredWindows(doctor._id.toString(), window));
//         }
//         return results;
//     },

//     async getAvailability(doctorId: string, fromInput: string, toInput: string){
//         const from = parseDate(fromInput, 'from');
//         const to = parseDate(toInput, 'to');
//         if(from >= to) throw new AppError('from must be before the exclusive to boundary', 400);
//         if(to.getTime() - from.getTime() > MAX_READ_RANGE_MS){
//             throw new AppError('Availability range cannot exceed 7 days', 400);
//         }

//         const doctor = await doctorRepository.findById(doctorId);
//         if(!doctor || doctor.verificationStatus !== 'VERIFIED'){
//             throw new AppError('Verified doctor not found', 404);
//         }

//         const [windows, bookedAppointments] = await Promise.all([
//             availabilitRepository.getAvailabilityInRange(doctorId, from, to),
//             appointmentRepository.findOverlappingBookedAppointments(doctorId, from, to)
//         ]);
//         const now = new Date();
//         const slots = windows.flatMap(window =>
//             generateSlots(window.startTime, window.endTime, APPOINTMENT_DURATION_MINUTES)
//         ).filter(slot => slot.startTime < to && slot.endTime > from)
//          .map(slot => {
//             const hasBooking = bookedAppointments.some(appointment =>
//                 appointment.startTime < slot.endTime && appointment.endTime > slot.startTime
//             );
//             return {
//                 startTime: slot.startTime,
//                 endTime: slot.endTime,
//                 status: slot.startTime <= now || hasBooking ? 'UNAVAILABLE' : 'AVAILABLE'
//             };
//         });

//         return {
//             doctorId, from, to,
//             appointmentDurationMinutes: APPOINTMENT_DURATION_MINUTES,
//             windows,
//             slots
//         };
//     },

//     async removeAvailability(userId: string, data: AvailabilityInput){
//         const doctor = await requireVerifiedDoctor(userId);
//         const doctorId = doctor._id.toString();
//         const removalStart = parseDate(data.startTime, 'startTime');
//         const removalEnd = parseDate(data.endTime, 'endTime');
//         if(removalStart >= removalEnd) throw new AppError('startTime must be before endTime', 400);
//         if(!isSlotBoundary(removalStart) || !isSlotBoundary(removalEnd)){
//             throw new AppError('Removal boundaries must align to 30-minute slots', 400);
//         }

//         const [windows, conflicts] = await Promise.all([
//             availabilitRepository.findOverlappingRange(doctorId, removalStart, removalEnd),
//             appointmentRepository.findOverlappingBookedAppointments(doctorId, removalStart, removalEnd)
//         ]);
//         if(conflicts.length > 0){
//             throw new AppError(
//                 'Availability cannot be removed because it contains booked appointments',
//                 409,
//                 {conflicts}
//             );
//         }
//         if(windows.length === 0){
//             throw new AppError('No availability exists in the requested range', 404);
//         }

//         const replacements: Array<{startTime: Date, endTime: Date}> = [];
//         for(const window of windows){
//             if(window.startTime < removalStart){
//                 replacements.push({
//                     startTime: window.startTime,
//                     endTime: new Date(Math.min(removalStart.getTime(), window.endTime.getTime()))
//                 });
//             }
//             if(window.endTime > removalEnd){
//                 replacements.push({
//                     startTime: new Date(Math.max(removalEnd.getTime(), window.startTime.getTime())),
//                     endTime: window.endTime
//                 });
//             }
//         }
//         const validReplacements = replacements.filter(window =>
//             window.endTime.getTime() - window.startTime.getTime() >= APPOINTMENT_DURATION_MS
//         );
//         const availability = await availabilitRepository.replaceWindows(
//             doctorId,
//             windows.map(window => window._id.toString()),
//             validReplacements
//         );
//         return {
//             removedRange: {startTime: removalStart, endTime: removalEnd},
//             availability
//         };
//     }
// };



// import { AnyBulkWriteOperation, ClientSession } from "mongoose";
// import { AvailabilityModel } from "../models/availability.model";

// export type AvailabilityWindowWrite = {
//     doctorId: string;
//     startTime: Date;
//     endTime: Date;
// };

// export type AvailabilityReplacement = Omit<AvailabilityWindowWrite, 'doctorId'>;

// function useSession<T extends { session(session: ClientSession): T }>(query: T, session?: ClientSession){
//     return session ? query.session(session) : query;
// }

// export const availabilityRepository = {
//     async createAvailability(data: AvailabilityWindowWrite, session?: ClientSession){
//         if(session){
//             const documents = await AvailabilityModel.create([data], {session});
//             return documents[0];
//         }
//         return AvailabilityModel.create(data);
//     },

//     async createBulkAvailability(data: AvailabilityWindowWrite[], session?: ClientSession){
//         return AvailabilityModel.insertMany(data, {
//             ordered: true,
//             ...(session ? {session} : {})
//         });
//     },

//     async getAvailability(doctorId: string, session?: ClientSession){
//         const query = AvailabilityModel.find({
//             doctorId,
//             endTime: {$gt: new Date()}
//         }).sort({startTime: 1}).lean();
//         return useSession(query, session).exec();
//     },

//     async findOverlappingOrAdjacent(
//         doctorId: string,
//         startTime: Date,
//         endTime: Date,
//         session?: ClientSession
//     ){
//         const query = AvailabilityModel.find({
//             doctorId,
//             startTime: {$lte: endTime},
//             endTime: {$gte: startTime}
//         }).sort({startTime: 1}).lean();
//         return useSession(query, session).exec();
//     },

//     async findOverlappingRange(
//         doctorId: string,
//         startTime: Date,
//         endTime: Date,
//         session?: ClientSession
//     ){
//         const query = AvailabilityModel.find({
//             doctorId,
//             startTime: {$lt: endTime},
//             endTime: {$gt: startTime}
//         }).sort({startTime: 1}).lean();
//         return useSession(query, session).exec();
//     },

//     async getAvailabilityInRange(
//         doctorId: string,
//         from: Date,
//         to: Date,
//         session?: ClientSession
//     ){
//         const query = AvailabilityModel.find({
//             doctorId,
//             startTime: {$lt: to},
//             endTime: {$gt: from}
//         }).sort({startTime: 1}).lean();
//         return useSession(query, session).exec();
//     },

//     async replaceWindows(
//         doctorId: string,
//         idsToDelete: string[],
//         replacements: AvailabilityReplacement[],
//         session?: ClientSession
//     ){
//         const operations: AnyBulkWriteOperation[] = [];

//         if(idsToDelete.length > 0){
//             operations.push({
//                 deleteMany: {
//                     filter: {_id: {$in: idsToDelete}, doctorId}
//                 }
//             });
//         }

//         for(const replacement of replacements){
//             operations.push({
//                 updateOne: {
//                     filter: {doctorId, ...replacement},
//                     update: {$setOnInsert: {doctorId, ...replacement}},
//                     upsert: true
//                 }
//             });
//         }

//         if(operations.length > 0){
//             await AvailabilityModel.bulkWrite(operations, {
//                 ordered: true,
//                 ...(session ? {session} : {})
//             });
//         }

//         if(replacements.length === 0) return [];

//         const query = AvailabilityModel.find({
//             doctorId,
//             $or: replacements.map(replacement => ({
//                 startTime: replacement.startTime,
//                 endTime: replacement.endTime
//             }))
//         }).sort({startTime: 1}).lean();
//         return useSession(query, session).exec();
//     }
// };