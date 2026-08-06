import { useQuery } from "@tanstack/react-query";
import { creditApi } from "../api/credit.api";

export const useTransactions = () => {
    const {data: wallet , isError: isWalletError, isLoading: isWalletLoading} = useQuery({
        queryKey: ['transactions'],
        queryFn: () => creditApi.getTransactions(),
    }); 

    return {wallet, isWalletError, isWalletLoading}
}