import queryClient from '@/shared/lib/queryClient';
import { queryKeys } from '@/shared/lib/queryKeys';

export const invalidateAppointmentQueries = () => Promise.all([
  queryClient.invalidateQueries({ queryKey: queryKeys.appointments }),
  queryClient.invalidateQueries({ queryKey: queryKeys.wallet }),
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  queryClient.invalidateQueries({ queryKey: queryKeys.payoutSummary }),
  queryClient.invalidateQueries({ queryKey: queryKeys.slots }),
  queryClient.invalidateQueries({ queryKey: queryKeys.doctorAvailability }),
]);
