import { getBrands } from "@/apis/brands.api";
import { CarCard } from "@/components/CarCard";
import { GET_BRANDS_KEY } from "@/constants/react-query-key.constant";
import { CarIcon, SearchBrokenIcon } from "@/icons";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Carousel, Form, Select } from "antd";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[90vh] w-full">
        <Image
          src="/images/imageBackground.jpeg"
          alt="banner"
          layout="fill"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
            <div className="max-w-2xl pt-20">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in">
                Thuê xe dễ dàng, <br />
                trải nghiệm tuyệt vời
              </h1>
              <p className="text-xl text-white/90 mb-8 animate-fade-in-delay">
                Dịch vụ cho thuê xe tự lái uy tín và chất lượng tại Hà Nội
              </p>
              <Button
                type="primary"
                size="large"
                className="bg-green-600 hover:bg-green-700 border-none h-12 px-8 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-delay-2"
                onClick={() => router.push("/cars")}
              >
                Khám phá ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-2xl -mt-28 shadow-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Tìm kiếm xe phù hợp
          </h2>
          <Form
            layout="vertical"
            onFinish={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6"
          >
            <Form.Item name="brand" className="mb-2">
              <Select
                size="large"
                placeholder="Hãng xe"
                className="w-full rounded-lg"
                suffixIcon={<CarIcon className="text-gray-400" />}
                dropdownStyle={{ borderRadius: "0.5rem" }}
              >
                <Select.Option value="all" label="Hãng xe">
                  Tất cả hãng xe
                </Select.Option>
                {(brandsData?.result || []).map((brand) => (
                  <Select.Option
                    key={brand._id}
                    value={brand._id}
                    label={brand.name}
                  >
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="numberSeat" className="mb-2">
              <Select
                size="large"
                placeholder="Số ghế"
                className="w-full rounded-lg"
                dropdownStyle={{ borderRadius: "0.5rem" }}
                options={[
                  { value: "all", label: "Tất cả số ghế" },
                  { value: "4 chỗ", label: "4 chỗ" },
                  { value: "5 chỗ", label: "5 chỗ" },
                  { value: "7 chỗ", label: "7 chỗ" },
                  { value: "8 chỗ", label: "8 chỗ" },
                ]}
              />
            </Form.Item>
            <Form.Item name="transmissions" className="mb-2">
              <Select
                size="large"
                placeholder="Truyền động"
                className="w-full rounded-lg"
                dropdownStyle={{ borderRadius: "0.5rem" }}
                options={[
                  { value: "all", label: "Tất cả loại số" },
                  { value: "Số sàn", label: "Số sàn" },
                  { value: "Số tự động", label: "Số tự động" },
                ]}
              />
            </Form.Item>
            <Form.Item name="cost" className="mb-2">
              <Select
                size="large"
                placeholder="Giá thuê"
                className="w-full rounded-lg"
                dropdownStyle={{ borderRadius: "0.5rem" }}
                options={[
                  { value: "all", label: "Tất cả mức giá" },
                  { value: "0 - 500K", label: "0 - 500K VND" },
                  { value: "501K - 1000K", label: "501K - 1000K VND" },
                ]}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-green-600 hover:bg-green-700 h-[40px] flex items-center justify-center gap-2 rounded-lg"
            >
              <SearchBrokenIcon />
              <span>Tìm kiếm</span>
            </Button>
          </Form>
        </div>
      </div>

      {/* Promotions Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
            Ưu đãi đặc biệt
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            Chương Trình Khuyến Mãi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nhận nhiều ưu đãi hấp dẫn từ CRT khi đặt xe ngay hôm nay
          </p>
        </div>
        <div className="relative mt-10">
          <button
            className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 bg-white shadow-md flex justify-center items-center border border-solid border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              carouselRef.current?.prev();
            }}
          >
            <LeftOutlined className="text-gray-600" />
          </button>
          <Carousel
            ref={carouselRef}
            rows={1}
            slidesToShow={3}
            autoplay
            dots={true}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 1,
                },
              },
            ]}
          >
            {arrayImage.map((value) => (
              <div key={value} className="px-3 py-2">
                <div className="overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-[1.02] duration-300 group cursor-pointer">
                  <div className="relative">
                    <Image
                      src={value || "/placeholder.svg"}
                      alt="promotion"
                      width={400}
                      height={250}
                      className="object-cover w-full h-[220px] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <span className="inline-block px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium mb-2">
                          Khuyến mãi
                        </span>
                        <h3 className="text-white font-bold">
                          Ưu đãi đặc biệt
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
          <button
            className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 bg-white shadow-md flex justify-center items-center border border-solid border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              carouselRef.current?.next();
            }}
          >
            <RightOutlined className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Recommended Cars Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
              Xe nổi bật
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              Xe dành cho bạn
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những chiếc xe được đánh giá cao nhất từ khách hàng của chúng tôi
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
              Đã xảy ra lỗi: {error.message}
            </div>
          ) : (
            <>
              <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.cars.map((car, carIndex) => (
                  <CarCard key={carIndex} dataCar={car} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/cars">
                  <Button
                    type="default"
                    size="large"
                    className="border-green-500 text-green-600 hover:text-green-700 hover:border-green-700 rounded-full px-8 h-12"
                  >
                    Xem tất cả xe
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col justify-center">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3 w-fit">
              Về chúng tôi
            </span>
            <h3 className="text-3xl md:text-4xl mb-6 font-bold text-gray-900">
              Cung cấp dịch vụ cho thuê xe đáng tin cậy
            </h3>

            <p className="text-gray-600 leading-relaxed">
              CRT đặt mục tiêu trở thành cộng động người dùng ô tô Văn minh & Uy
              tín #1 tại Đà Nẵng, nhằm mang lại những giá trị thiết thực cho tất
              cả những thành viên hướng đến một cuộc sống tốt đẹp hơn.
            </p>

            <Link href="/about-us" className="mt-6">
              <Button
                type="default"
                className="border-green-500 text-green-600 hover:text-green-700 hover:border-green-700 rounded-lg"
              >
                Tìm hiểu thêm
              </Button>
            </Link>
          </div>

          <div className="relative h-[300px] md:h-auto rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/imageBackground.jpeg"
              alt="banner"
              layout="fill"
              className="object-cover transition-transform duration-700 hover:scale-110"
            />
          </div>

          <div className="grid grid-cols-1 grid-rows-3 gap-6">
            <div className="flex gap-4 items-center bg-gray-50 p-5 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-sm hover:shadow-md">
              <div className="relative aspect-square w-16 h-16 shrink-0 bg-green-100 rounded-full p-3">
                <Image
                  src="/images/ad-1.svg"
                  alt="ad"
                  layout="fill"
                  className="p-3"
                />
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Thuê xe an toàn
                </h4>
                <p className="text-gray-600 text-sm">
                  Tất cả các xe trên CRT đã được kiểm duyệt và chịu sự quản lý
                  của CRT
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center bg-gray-50 p-5 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-sm hover:shadow-md">
              <div className="relative aspect-square w-16 h-16 shrink-0 bg-blue-100 rounded-full p-3">
                <Image
                  src="/images/ad-2.svg"
                  alt="ad"
                  layout="fill"
                  className="p-3"
                />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Thủ tục đơn giản
                </h4>
                <p className="text-gray-600 text-sm">
                  Chỉ cần cung cấp CCCD và bằng lái xe cho chúng tôi
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center bg-gray-50 p-5 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-sm hover:shadow-md">
              <div className="relative aspect-square w-16 h-16 shrink-0 bg-amber-100 rounded-full p-3">
                <Image
                  src="/images/ad-3.svg"
                  alt="ad"
                  layout="fill"
                  className="p-3"
                />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Thanh toán dễ dàng
                </h4>
                <p className="text-gray-600 text-sm">
                  Có thể lựa chọn thanh toán khi hoàn tất chuyến đi hoặc qua
                  trang thanh toán trực tuyến
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <Image
                src="/images/imageBackground.jpeg"
                alt="banner"
                layout="fill"
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>

            <div className="order-1 md:order-2">
              <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
                Quy trình
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Bắt đầu trải nghiệm cùng chúng tôi
              </h3>
              <p className="text-gray-600 mb-10">
                Chỉ với 4 bước đơn giản để trải nghiệm thuê xe CRT một cách
                nhanh chóng
              </p>

              <div className="space-y-8">
                <div className="flex gap-6 items-start group">
                  <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex justify-center items-center text-xl text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    01
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      Đặt xe trên app/web CRT
                    </h4>
                    <p className="text-gray-500">
                      Chọn xe phù hợp với nhu cầu của bạn
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex justify-center items-center text-xl text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    02
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      Nhận xe
                    </h4>
                    <p className="text-gray-500">
                      Kiểm tra xe và hoàn tất thủ tục
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex justify-center items-center text-xl text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    03
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      Bắt đầu hành trình
                    </h4>
                    <p className="text-gray-500">Tận hưởng chuyến đi của bạn</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex justify-center items-center text-xl text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    04
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      Trả xe & kết thúc chuyến đi
                    </h4>
                    <p className="text-gray-500">
                      Đánh giá trải nghiệm của bạn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 space-y-12">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-green-50 to-green-100 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full opacity-50 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-200 rounded-full opacity-50 -ml-20 -mb-20"></div>

          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left relative z-10">
            <span className="inline-block px-4 py-1 bg-green-200 text-green-700 rounded-full text-sm font-medium mb-3">
              Hợp tác
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Bạn muốn hợp tác với chúng tôi?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              Bạn muốn cho thuê xe? Bấm xem thêm để biết thêm thông tin chi tiết
              về việc hợp tác với chúng tôi
            </p>
            <Button
              type="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700 border-none h-12 px-8 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Xem thêm
            </Button>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
            <Image
              alt="partnership"
              src="/images/car.jpg"
              layout="fill"
              className="object-cover transition-transform duration-700 hover:scale-110"
            />
          </div>
        </div>

        <div className="p-10 rounded-3xl bg-gradient-to-r from-blue-50 to-blue-100 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full opacity-50 -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-200 rounded-full opacity-50 -mr-20 -mb-20"></div>

          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
            <Image
              alt="about us"
              src="/images/car.jpg"
              layout="fill"
              className="object-cover transition-transform duration-700 hover:scale-110"
            />
          </div>

          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left order-1 md:order-2 relative z-10">
            <span className="inline-block px-4 py-1 bg-blue-200 text-blue-700 rounded-full text-sm font-medium mb-3">
              Về chúng tôi
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Bạn muốn biết thêm thông tin về chúng tôi?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              CRT mang lại một ứng dụng cho thuê xe tự lái ở Đà Nẵng và sẽ mở
              rộng ra hơn khắp Việt Nam trong thời gian tới. CRT mong rằng sẽ
              đem lại trải nghiệp thuê xe tự lái một cách an toàn và chuyên
              nghiệp nhất
            </p>
            <Button
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700 border-none h-12 px-8 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Xem thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Đăng ký nhận thông tin ưu đãi
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nhận thông tin về các chương trình khuyến mãi và ưu đãi đặc biệt từ
            CRT
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
            />
            <Button
              type="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700 border-none h-12 px-6 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
