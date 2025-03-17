import { getCarsLiked } from "@/apis/user-cars.api";
import { CarLikeCard } from "@/components/CarLikeCard";
import { GET_CARS_LIKED } from "@/constants/react-query-key.constant";
import useLocalStorage from "@/hooks/useLocalStorage";
import { LoadingOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";

export default function CarLiked() {
  const [accessToken] = useLocalStorage("access_token");
  console.log(accessToken);

  const { isLoading, data } = useQuery({
    queryKey: [GET_CARS_LIKED],
    queryFn: () => getCarsLiked(accessToken),
  });
  console.log(data?.result);
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
          <div className="flex flex-col gap-5 ">
            {data?.result.map((value, index) => (
              <CarLikeCard key={index} info={value} accessToken={accessToken} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
