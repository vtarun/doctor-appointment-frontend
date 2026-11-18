import { queryKeys } from '@/shared/lib/queryKeys';
import { useQuery } from "@tanstack/react-query";
import { creditApi } from "../api/credit.api";

export const useTransactions = () => {
    const {data: transactions , isError: isError, isLoading: isLoading} = useQuery({
        queryKey: queryKeys.transactions,
        queryFn: () => creditApi.getTransactions(),
    }); 

    return {transactions, isError, isLoading}
}