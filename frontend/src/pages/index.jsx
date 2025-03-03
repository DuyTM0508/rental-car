import { getBrands } from "@/apis/brands.api"
import { CarCard } from "@/components/CarCard"
import { GET_BRANDS_KEY } from "@/constants/react-query-key.constant"
import { CarIcon, SearchBrokenIcon } from "@/icons"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Carousel, Form, Select } from "antd"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useRef } from "react"

export default function HomePage() {
  const router = useRouter()
  const carouselRef = useRef(null)

  const handleSearch = (values) => {
    const { brand, numberSeat, transmissions, cost } = values
    const params = {}

    if (brand) {
      params.brand = brand
    }

    if (numberSeat) {
      params.numberSeat = numberSeat
    }

    if (transmissions) {
      params.transmissions = transmissions
    }

    if (cost) {
      let minCost, maxCost

      switch (cost) {
        case "0 - 500K":
          minCost = "0"
          maxCost = "500000"
          break
        case "501K - 1000K":
          minCost = "501000"
          maxCost = "1000000"
          break
      }

      if (minCost) {
        params["cost[gte]"] = minCost
      }

      if (maxCost) {
        params["cost[lte]"] = maxCost
      }
    }

    router.push({
      pathname: "/cars",
      query: params,
    })
  }

  const { data: brandsData } = useQuery({
    queryKey: [GET_BRANDS_KEY],
    queryFn: getBrands,
  })

  const fetchCars = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/cars?limit=8&totalRatings[gte]=4&totalRatings[lte]=5`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          params: { status: "Hoạt động" },
        },
      )
      return response.data.result
    } catch (error) {
      console.log(error)
    }
  }

  const { isLoading, error, data } = useQuery(["cars"], fetchCars)
  const arrayImage = ["/discount_1.png", "/discount_2.png", "/discount_3.png", "/discount_4.png", "/discount_5.png"]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <div className="mb-16 max-w-6xl mx-auto">
        <div className="relative h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
          <Image src="/images/imageBackground.jpeg" alt="banner" layout="fill" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent">
            <div className="max-w-2xl mx-auto pt-20 px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Thuê xe dễ dàng, trải nghiệm tuyệt vời</h1>
              <p className="text-xl text-white/90 mb-8">Dịch vụ cho thuê xe tự lái uy tín và chất lượng tại Hà Nội</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl -mt-24 w-11/12 sm:w-4/5 mx-auto z-50 relative p-6 shadow-xl border border-gray-100">
          <Form
            layout="vertical"
            onFinish={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6"
          >
            <Form.Item name="brand" className="mb-2">
              <Select
                size="large"
                placeholder="Hãng xe"
                className="w-full"
                suffixIcon={<CarIcon className="text-gray-400" />}
              >
                <Select.Option value="all" label="Hãng xe">
                  Hãng xe
                </Select.Option>
                {(brandsData?.result || []).map((brand) => (
                  <Select.Option key={brand._id} value={brand._id} label={brand.name}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="numberSeat" className="mb-2">
              <Select
                size="large"
                placeholder="Số ghế"
                className="w-full"
                options={[
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
                className="w-full"
                options={[
                  { value: "Số sàn", label: "Số sàn" },
                  { value: "Số tự động", label: "Số tự động" },
                ]}
              />
            </Form.Item>
            <Form.Item name="cost" className="mb-2">
              <Select
                size="large"
                placeholder="Giá thuê"
                className="w-full"
                options={[
                  { value: "0 - 500K", label: "0 - 500K VND" },
                  { value: "501K - 1000K", label: "501K - 1000K VND" },
                ]}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchBrokenIcon />}
              size="large"
              className="bg-green-600 hover:bg-green-700 h-[40px] flex items-center justify-center"
            >
              Tìm kiếm
            </Button>
          </Form>
        </div>
      </div>

      {/* Promotions Section */}
      <div className="my-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Chương Trình Khuyến Mãi</h2>
          <p className="text-lg text-gray-500">Nhận nhiều ưu đãi hấp dẫn từ CRT</p>
        </div>
        <div className="relative mt-10">
          <button
            className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 bg-white shadow-md flex justify-center items-center border border-solid border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              carouselRef.current?.prev()
            }}
          >
            <LeftOutlined className="text-gray-600" />
          </button>
          <Carousel
            ref={carouselRef}
            rows={1}
            slidesToShow={3}
            autoplay
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
              <div key={value} className="px-2">
                <div className="overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-[1.02] duration-300">
                  <Image
                    src={value || "/placeholder.svg"}
                    alt="promotion"
                    width={400}
                    height={300}
                    className="object-cover w-full h-[200px]"
                  />
                </div>
              </div>
            ))}
          </Carousel>
          <button
            className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 bg-white shadow-md flex justify-center items-center border border-solid border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              carouselRef.current?.next()
            }}
          >
            <RightOutlined className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Recommended Cars Section */}
      <div className="mb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Xe dành cho bạn</h2>
          <p className="text-gray-500">Những chiếc xe được đánh giá cao nhất</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">Đã xảy ra lỗi: {error.message}</div>
        ) : (
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.cars.map((car, carIndex) => (
              <Link href={`/cars/${car?._id}`} key={carIndex} className="block">
                <div className="transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
                  <CarCard dataCar={car} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col justify-center">
          <div className="text-xl font-semibold flex items-center gap-3 text-green-600 mb-4">
            <CarIcon />
            <span>Giới thiệu</span>
          </div>

          <h3 className="text-3xl mb-6 font-bold">Cung cấp dịch vụ cho thuê xe đáng tin cậy</h3>

          <p className="text-gray-600 leading-relaxed">
            CRT đặt mục tiêu trở thành cộng động người dùng ô tô Văn minh & Uy tín #1 tại Đà Nẵng, nhằm mang lại những
            giá trị thiết thực cho tất cả những thành viên hướng đến một cuộc sống tốt đẹp hơn.
          </p>
        </div>
        <div className="relative h-[300px] md:h-auto rounded-xl overflow-hidden shadow-lg">
          <Image src="/images/imageBackground.jpeg" alt="banner" layout="fill" className="object-cover" />
        </div>
        <div className="grid grid-cols-1 grid-rows-3 gap-6">
          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="relative aspect-square w-16 h-16 shrink-0">
              <Image src="/images/ad-1.svg" alt="ad" layout="fill" />
            </div>

            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Thuê xe an toàn</h4>
              <p className="text-gray-600 text-sm">
                Tất cả các xe trên CRT đã được kiểm duyệt và chịu sự quản lý của CRT
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="relative aspect-square w-16 h-16 shrink-0">
              <Image src="/images/ad-2.svg" alt="ad" layout="fill" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Thủ tục đơn giản</h4>
              <p className="text-gray-600 text-sm">Chỉ cần cung cấp CCCD và bằng lái xe cho chúng tôi</p>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="relative aspect-square w-16 h-16 shrink-0">
              <Image src="/images/ad-3.svg" alt="ad" layout="fill" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Thanh toán dễ dàng</h4>
              <p className="text-gray-600 text-sm">
                Có thể lựa chọn thanh toán khi hoàn tất chuyến đi hoặc qua trang thanh toán trực tuyến
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
          <Image src="/images/imageBackground.jpeg" alt="banner" layout="fill" className="object-cover" />
        </div>
        <div className="order-1 md:order-2">
          <div className="text-xl text-green-600 font-bold flex gap-2 items-center mb-4">
            <CarIcon />
            <span>Hướng Dẫn Thuê Xe</span>
          </div>
          <h3 className="text-3xl font-bold mb-4">Bắt đầu trải nghiệm cùng chúng tôi</h3>
          <p className="text-gray-600 mb-8">Chỉ với 4 bước đơn giản để trải nghiệm thuê xe CRT một cách nhanh chóng</p>

          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-14 h-14 rounded-full bg-green-500 flex justify-center items-center text-2xl text-white font-bold shadow-lg">
                01
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800">Đặt xe trên app/web CRT</h4>
                <p className="text-gray-500 text-sm">Chọn xe phù hợp với nhu cầu của bạn</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-14 h-14 rounded-full bg-green-500 flex justify-center items-center text-2xl text-white font-bold shadow-lg">
                02
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800">Nhận xe</h4>
                <p className="text-gray-500 text-sm">Kiểm tra xe và hoàn tất thủ tục</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-14 h-14 rounded-full bg-green-500 flex justify-center items-center text-2xl text-white font-bold shadow-lg">
                03
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800">Bắt đầu hành trình</h4>
                <p className="text-gray-500 text-sm">Tận hưởng chuyến đi của bạn</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="shrink-0 w-14 h-14 rounded-full bg-green-500 flex justify-center items-center text-2xl text-white font-bold shadow-lg">
                04
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800">Trả xe & kết thúc chuyến đi</h4>
                <p className="text-gray-500 text-sm">Đánh giá trải nghiệm của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Sections */}
      <div className="space-y-8 mb-16">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-md">
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Bạn muốn hợp tác với chúng tôi?</h3>
            <p className="text-gray-600 mb-8 max-w-md">
              Bạn muốn cho thuê xe? Bấm xem thêm để biết thêm thông tin chi tiết về việc hợp tác với chúng tôi
            </p>
            <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700">
              Xem thêm
            </Button>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
            <Image alt="partnership" src="/images/car.jpg" layout="fill" className="object-cover" />
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-md">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
            <Image alt="about us" src="/images/car.jpg" layout="fill" className="object-cover" />
          </div>

          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left order-1 md:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Bạn muốn biết thêm thông tin về chúng tôi?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              CRT mang lại một ứng dụng cho thuê xe tự lái ở Hà Nội và sẽ mở rộng ra hơn khắp Việt Nam trong thời gian
              tới. CRT mong rằng sẽ đem lại trải nghiệp thuê xe tự lái một cách an toàn và chuyên nghiệp nhất
            </p>
            <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700">
              Xem thêm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

