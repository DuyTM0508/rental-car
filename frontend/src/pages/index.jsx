import { CarCard } from "@/components/CarCard";
import { CarIcon, SearchBrokenIcon } from "@/icons";
import { Select } from "antd";
import { Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_BRANDS_KEY } from "@/constants/react-query-key.constant";
import { getBrands } from "@/apis/brands.api";
import { Carousel } from "antd";
import { range } from "lodash-es";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useRef } from "react";
export default function HomePage() {
  const router = useRouter();

  const carouselRef = useRef(null);

  const handleSearch = (values) => {
    const { brand, numberSeat, transmissions, cost } = values;
    const params = {};

    if (brand) {
      params.brand = brand;
    }

    if (numberSeat) {
      params.numberSeat = numberSeat;
    }

    if (transmissions) {
      params.transmissions = transmissions;
    }

    if (cost) {
      let minCost, maxCost;

      switch (cost) {
        case "0 - 500K":
          minCost = "0";
          maxCost = "500000";
          break;
        case "501K - 1000K":
          minCost = "501000";
          maxCost = "1000000";
          break;
      }

      if (minCost) {
        params["cost[gte]"] = minCost;
      }

      if (maxCost) {
        params["cost[lte]"] = maxCost;
      }
    }

    router.push({
      pathname: "/cars",
      query: params,
    });
  };

  const { data: brandsData } = useQuery({
    queryKey: [GET_BRANDS_KEY],
    queryFn: getBrands,
  });

  const fetchCars = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/cars?limit=8&totalRatings[gte]=4&totalRatings[lte]=5`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          params: { status: "Hoạt động" },
        }
      );
      return response.data.result;
    } catch (error) {
      console.log(error);
    }
  };

  const { isLoading, error, data } = useQuery(["cars"], fetchCars);
  const arrayImage = [
    "/discount_1.png",
    "/discount_2.png",
    "/discount_3.png",
    "/discount_4.png",
    "/discount_5.png",
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 max-w-6xl mx-auto">
        <div className="relative h-[80vh]">
          <Image
            src="/images/bg-landingpage.png"
            alt="banner"
            layout="fill"
            className="object-cover rounded-xl"
          />
        </div>

        <div className="bg-white rounded-xl -mt-16 w-4/5 mx-auto z-50 relative pt-8 px-8 shadow-lg h-28">
          <Form
            layout="vertical"
            onFinish={handleSearch}
            className="grid grid-cols-5 gap-6 h-full"
          >
            <Form.Item name="brand">
              <Select size="large" placeholder="Hãng xe">
                <Option value="all" label="Hãng xe">
                  Hãng xe
                </Option>
                {(brandsData?.result || []).map((brand) => (
                  <Option key={brand._id} value={brand._id} label={brand.name}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="numberSeat">
              <Select
                size="large"
                placeholder="Số ghế"
                options={[
                  { value: "4 chỗ" },
                  { value: "7 chỗ" },
                  { value: "5 chỗ" },
                  { value: "8 chỗ" },
                ]}
              />
            </Form.Item>
            <Form.Item name="transmissions">
              <Select
                size="large"
                placeholder="Truyền động"
                options={[{ value: "Số sàn" }, { value: "Số tự động" }]}
              />
            </Form.Item>
            <Form.Item name="cost">
              <Select
                size="large"
                placeholder="Giá"
                options={[{ value: "0 - 500K" }, { value: "501K - 1000K" }]}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchBrokenIcon />}
              size="large"
            >
              Tìm kiếm
            </Button>
          </Form>
        </div>
      </div>

      <div className="my-10">
        <h2 className="text-center font-medium text-2xl">
          Chương Trình Khuyến Mãi
        </h2>
        <div className="text-center text-lg text-gray-500">
          Nhận nhiều ưu đãi hấp dẫn từ CRT
        </div>
        <div className="relative mt-10">
          <div
            className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 bg-white/50 flex justify-center items-center border border-solid border-gray-200 cursor-pointer"
            onClick={() => {
              carouselRef.current?.prev();
            }}
          >
            <LeftOutlined className="text-gray-400" />
          </div>
          <Carousel ref={carouselRef} rows={1} slidesToShow={3}>
            {arrayImage.map((value) => (
              <div key={value} className="px-2">
                {/* <div className="bg-green-300 h-60 rounded-md flex justify-center items-center">
                  {value + 1}
                </div> */}
                <Image
                  src={value}
                  alt="banner"
                  width={400}
                  height={300}
                  className="object-cover rounded-xl "
                />
              </div>
            ))}
          </Carousel>
          <div
            className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 bg-white/50 flex justify-center items-center border border-solid border-gray-200 cursor-pointer"
            onClick={() => {
              carouselRef.current?.next();
            }}
          >
            <RightOutlined className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-center text-2xl">Xe dành cho bạn</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <div className="mx-auto grid grid-cols-4 gap-4">
            {data.cars.map((car, CarIndex) => (
              <Link href={`/cars/${car?._id}`}>
                <CarCard key={CarIndex} dataCar={car} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-40 grid grid-cols-3 min-h-[300px] gap-4">
        <div>
          <div className="text-xl font-semibold flex items-center gap-3 text-green-500">
            <CarIcon />
            <span>Giới thiệu</span>
          </div>

          <div className="text-3xl my-6 font-bold">
            Cung cấp dịch vụ cho thuê xe đáng tin cậy
          </div>

          <div className="text-gray-500 leading-6">
            CRT đặt mục tiêu trở thành cộng động người dùng ô tô Văn minh & Uy
            tín #1 tại Đà Nẵng, nhằm mang lại những giá trị thiết thực cho tất
            cả những thành viên hướng đến một cuộc sống tốt đẹp hơn.
          </div>
        </div>
        <div className="relative">
          <Image
            src="/images/bg-landingpage.png"
            alt="banner"
            layout="fill"
            className="object-cover rounded-xl"
          />
        </div>
        <div className="grid grid-cols-1 grid-rows-3 items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="relative aspect-square w-16 h-16">
              <Image src="/images/ad-1.svg" alt="ad" layout="fill" />
            </div>

            <div>
              <div className="text-2xl my-4 font-semibold">Thuê xe an toàn</div>
              <div className="text-gray-500">
                Tất cả các xe trên CRT đã được kiểm duyệt và chịu sự quản lý của
                CRT
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative aspect-square w-16 h-16">
              <Image src="/images/ad-2.svg" alt="ad" layout="fill" />
            </div>
            <div>
              <div className="text-2xl my-4 font-semibold">
                Thủ tục đơn giản
              </div>
              <div className="text-gray-500">
                Chỉ cần cung cấp CCCD và bằng lái xe cho chúng tôi
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative aspect-square w-16 h-16">
              <Image src="/images/ad-3.svg" alt="ad" layout="fill" />
            </div>
            <div>
              <div className="text-2xl my-4 font-semibold">
                Thanh toán dễ dàng
              </div>
              <div className="text-gray-500">
                Có thể lựa chọn thanh toán khi hoàn tất chuyến đi hoặc qua trang
                thanh toán trực tuyến
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 min-h-[500px]">
        <div className="relative">
          <Image
            src="/images/bg-landingpage.png"
            alt="banner"
            layout="fill"
            className="object-cover rounded-xl"
          />
        </div>
        <div>
          <div className="text-xl text-green-500 font-bold flex gap-2 items-center">
            <CarIcon />
            <span>Hướng Dẫn Thuê Xe</span>
          </div>
          <div className="text-3xl font-bold my-6">
            Bắt đầu trải nghiệm cùng chúng tôi
          </div>
          <div className="text-gray-500">
            Chỉ với 4 bước đơn giản để trải nghiệm thuê xe CRT một cách nhanh
            chóng
          </div>

          <div className="mt-4 grid grid-cols-1 grid-rows-4 gap-6">
            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-12 h-12 rounded-full bg-green-300 flex justify-center items-center text-3xl text-white font-bold">
                01
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  Đặt xe trên app/web CRT
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-12 h-12 rounded-full bg-green-300 flex justify-center items-center text-3xl text-white font-bold">
                02
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  Nhận xe
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-12 h-12 rounded-full bg-green-300 flex justify-center items-center text-3xl text-white font-bold">
                03
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  Bắt đầu hành trình
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-12 h-12 rounded-full bg-green-300 flex justify-center items-center text-3xl text-white font-bold">
                04
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  Trả xe & kết thúc chuyến đi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 p-4 rounded-xl bg-green-50 grid grid-cols-2 gap-6">
        <div className="flex flex-col justify-center items-center">
          <h1>Bạn muốn hợp tác với chúng tôi?</h1>
          <div className="text-center text-base">
            Bạn muốn cho thuê xe? Bấm xem thêm để biết thêm thông tin chi tiết
            về việc hợp tác với chúng tôi
          </div>
          <Button className="mt-10" type="primary">
            Xem thêm
          </Button>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image alt="hh" src="/images/car.jpg" layout="fill" />
        </div>
      </div>

      <div className="mt-10 p-4 rounded-xl bg-blue-100 grid grid-cols-2 gap-6">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image alt="hh" src="/images/car.jpg" layout="fill" />
        </div>

        <div className="flex flex-col justify-center items-center">
          <h1>Bạn muốn biết thêm thông tin về chúng tôi?</h1>
          <div className="text-center text-base">
            CRT mang lại một ứng dụng cho thuê xe tự lái ở Hà Nội và sẽ mở rộng
            ra hơn khắp Việt Nam trong thời gian tới. CRT mong rằng sẽ đem lại
            trải nghiệp thuê xe tự lái một cách an toàn và chuyên nghiệp nhất
          </div>
          <Button className="mt-10" type="primary">
            Xem thêm
          </Button>
        </div>
      </div>
    </div>
  );
}
