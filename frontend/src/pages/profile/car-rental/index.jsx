import { CarRentalCard } from "@/components/CardRentalCard";
import { useQuery } from "@tanstack/react-query";
import { getHistoryBooking } from "@/apis/user-bookings.api";
import { GET_HISTORY_BOOKING_KEY } from "@/constants/react-query-key.constant";
import useLocalStorage from "@/hooks/useLocalStorage";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function CarRentalPage() {
  const [accessToken] = useLocalStorage("access_token");
  const { isLoading, data } = useQuery({
    queryKey: [GET_HISTORY_BOOKING_KEY],
    queryFn: () => getHistoryBooking(accessToken),
  });
  console.log(data);
  return (
    <div>
      <div className="mb-20">
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "70vh",
            }}
          >
            <Spin
              indicator={
                <LoadingOutlined
                  style={{
                    fontSize: 24,
                  }}
                  spin
                />
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5 overflow-y-scroll h-[580px]">
            {data?.result.map((value, index) => (
              <CarRentalCard
                key={index}
                info={value}
                accessToken={accessToken}
                bookingId={value?.bookingId}
                carId={value?.carId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
