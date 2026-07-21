import { axiosInstance } from "@/shared/api/axiosInstance";

export const doctorApi = {
    getDoctors: async (speciality?: string) => {
        const url = speciality ? `/doctors?speciality=${speciality}` : '/doctors';
        const response = await axiosInstance.get(url);
        return response.data;
    },

    getDoctorById: async (id: string) => {
        const response = await axiosInstance.get(`/doctors/${id}`);
        return response.data;
  }
}