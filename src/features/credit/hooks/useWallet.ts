import { useQuery } from "@tanstack/react-query";
import { creditApi } from "../api/credit.api";

export const useWallet = () => {
    const {data: wallet , isError, isLoading} = useQuery({
        queryKey: ['wallet'],
        queryFn: () => creditApi.getWallet(),
    }); 

    return {wallet, isError, isLoading}
}