import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  CreditTransaction,
  EarningsSummary,
  PayoutRequest,
  PayoutRequestInput
} from '../types';

export const earningsApi = {
  getSummary: async (): Promise<EarningsSummary> => {
    const response = await axiosInstance.get('/payouts/me/summary');
    return response.data;
  },

  requestPayout: async (input: PayoutRequestInput): Promise<PayoutRequest> => {
    const response = await axiosInstance.post('/payouts/request', input);
    return response.data;
  },

  getTransactions: async (): Promise<CreditTransaction[]> => {
    const response = await axiosInstance.get('/credit/transactions');
    return response.data;
  }
};