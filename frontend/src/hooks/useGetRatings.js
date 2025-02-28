import { apiClient } from "@/apis/client"
import { useInfiniteQuery } from "@tanstack/react-query"

export const useRatingsOfCar = (carId) => {
    const fetchRatings = async ({ pageParam = 1 }) => {
        const { data } = await apiClient.request({
            method: "GET",
            url: `cars/ratings/${carId}?page=${pageParam}&limit=4`
        });
        return data
    };

    return useInfiniteQuery({
        queryKey: ['ratings', carId],
        queryFn: fetchRatings,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : null;
        }
    })
}