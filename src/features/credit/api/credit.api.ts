import { axiosInstance } from "@/shared/api/axiosInstance"

export const creditApi = {
    getWallet: async () => {
        const response = await axiosInstance.get('/wallet');
        return response.data;
    },
    getTransactions: async () => {
        const response = await axiosInstance.get('/transactions');
        return response.data;
    }
}