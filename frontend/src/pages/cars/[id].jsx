import { Feedback } from "@/components/Feedback";
import { DateRangePicker } from "@/components/antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  BackCameraIcon,
  BagFilledIcon,
  BluetoothIcon,
  DriverLicenceIcon,
  GpsIcon,
  IdCardIcon,
  ImageFilledIcon,
  InfoIcon,
  MapIcon,
  SeatIcon,
  ShieldCheckOutlineIcon,
  StarFilledIcon,
  TransmissionIcon,
  UsbIcon,
} from "@/icons";

import { apiClient } from "@/apis/client";
import { getCarDetail, likeCars } from "@/apis/user-cars.api";
import { GET_CAR_DETAILS } from "@/constants/react-query-key.constant";
import { useRatingsOfCar } from "@/hooks/useGetRatings";
import { useDatesState } from "@/recoils/dates.state";
import { useUserState } from "@/recoils/user.state";
import { CloseOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image as AntImage, Button, Modal, Table, Tag, message } from "antd";
import axios from "axios";
import moment from "moment-timezone";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const carServices = [
  { icon: MapIcon, name: "Bản đồ" },
  { icon: BluetoothIcon, name: "Bluetooth" },
  { icon: BackCameraIcon, name: "Camera lùi" },
  { icon: GpsIcon, name: "Định vị GPS" },
  { icon: UsbIcon, name: "Khe cắm usb" },
];

const BorderlessTable = styled(Table)`
  .ant-table {
    background-color: transparent;
  }
`;

export default function CarDetailPage() {
  const router = useRouter();
  const carId = router.query.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCheckOpen, setIsModalCheckOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useUserState();
  const [accessToken, setAccessToken, clearAccessToken] = useLocalStorage(
    "access_token",
    ""
  );
  const [liked, setLiked] = useState();

  const handleOk = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const getProfile = async () => {
      try {
        const value = window.localStorage.getItem("access_token");

        if (value !== null) {
          const { data } = await apiClient.request({
            method: "GET",
            url: "/users/get-user",
            headers: {
              Authorization: `Bearer ${JSON.parse(value)}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          // Update the Recoil state with the fetched user data
          setUser(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProfile(); // Call the fetchData function
  }, [setUser]);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk1 = () => {
    setIsModalCheckOpen(false);
  };

  const handleCancel1 = () => {
    setIsModalCheckOpen(false);
  };

  const handleRent = () => {
    if (user === null) {
      setIsModalOpen(true);
    } else if (
      user?.result?.driverLicenses?.status === "Chưa xác thực" ||
      user?.result?.driverLicenses === undefined
    ) {
      setIsModalCheckOpen(true);
    } else {
      if (validationMessage === "Khoảng ngày đã được thuê.") {
        message.error("Khoảng ngày đã được thuê. Vui lòng chọn ngày khác!");
      } else {
        router.push(`/booking/${car?.result._id}`);
      }
    }
  };

  const [dates, setDates] = useDatesState();
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");

  function isDateBooked(startDate, endDate) {
    for (const slot of bookedTimeSlots) {
      const bookedStart = moment(slot.from);
      const bookedEnd = moment(slot.to);

      if (bookedStart >= startDate && bookedEnd <= endDate) return true;
    }

    return false; // Khoảng ngày không được đặt
  }

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;

      if (isDateBooked(startDate, endDate)) {
        setValidationMessage("Khoảng ngày đã được thuê.");
      } else {
        setValidationMessage("");
      }
    }
    setDates(dates);
  };

  const disabledRangeTime = (_, type) => {
    if (type === "start") {
      return {
        disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 17, 18, 19, 20, 21, 22, 23],
      };
    }
    return {
      disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 17, 18, 19, 20, 21, 22, 23],
    };
  };

  const disabledDate = (current) => {
    const isPastDate = current && current < moment().startOf("day");
    const isBookedDate = bookedTimeSlots.some((slot) => {
      const arrayDayEnd = moment(slot.to)
        .format("DD-MM-YYYY HH:mm")
        .split(" ")[0]
        .split("-");

      const dEnd = new Date(
        `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
      );
      dEnd.setDate(dEnd.getDate() + 1);

      const arrayDayStart = moment(slot.from)
        .format("DD-MM-YYYY HH:mm")
        .split(" ")[0]
        .split("-");

      const dStart = new Date(
        `${arrayDayStart[1]}-${arrayDayStart[0]}-${arrayDayStart[2]}`
      );

      return current >= dStart && current <= dEnd;
    });
    return isPastDate || isBookedDate;
  };

  const {
    data: ratings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRatingsOfCar(carId);

  const { data: car } = useQuery({
    queryKey: [GET_CAR_DETAILS, carId],
    queryFn: () => getCarDetail(carId),
  });

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        // Fetch chi tiết xe từ API
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/cars/${carId}`
        );
        const carData = response.data.result;

        // Kiểm tra xem user hiện tại có trong mảng likes không
        const userLiked = carData.likes.includes(user?.id);
        setLiked(userLiked);
      } catch (error) {
        console.error("Error fetching car details", error);
      }
    };

    checkLikeStatus();
  }, [carId, user?.id]);

  const apiLikeCar = useMutation({
    mutationFn: likeCars,
    onSuccess: () => {
      setLiked(!liked);
      if (!liked) {
        message.success("Đã thêm vào danh sách xe yêu thích");
      } else {
        message.success("Đã xóa khỏi danh sách xe yêu thích");
      }
    },
  });

  const handleLikeClick = () => {
    apiLikeCar.mutateAsync({ accessToken, carId });
  };

  const result = useQuery({
    queryKey: ["getScheduleCar", carId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/bookings/${carId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setBookedTimeSlots(response.data.result);
        return response.data.result;
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="grid h-[600px] gap-4 grid-cols-4 grid-rows-3 relative rounded-xl overflow-hidden shadow-lg">
        <div className="relative col-span-3 row-span-3 rounded-xl overflow-hidden transition-transform hover:scale-[1.01] duration-300">
          <Image
            alt={car?.result.model.name || "Car"}
            src={car?.result.thumb || "/placeholder.svg"}
            layout="fill"
            className="object-cover"
          />
        </div>
        <div className="relative rounded-xl overflow-hidden transition-transform hover:scale-[1.05] duration-300">
          <Image
            alt={`${car?.result.model.name || "Car"} image 1`}
            src={car?.result.images[0] || "/placeholder.svg"}
            layout="fill"
            className="object-cover"
          />
        </div>
        <div className="relative rounded-xl overflow-hidden transition-transform hover:scale-[1.05] duration-300">
          <Image
            alt={`${car?.result.model.name || "Car"} image 2`}
            src={car?.result.images[1] || "/placeholder.svg"}
            layout="fill"
            className="object-cover"
          />
        </div>
        <div className="relative rounded-xl overflow-hidden transition-transform hover:scale-[1.05] duration-300">
          <Image
            alt={`${car?.result.model.name || "Car"} image 3`}
            src={car?.result.images[2] || "/placeholder.svg"}
            layout="fill"
            className="object-cover"
          />
        </div>

        <AntImage.PreviewGroup
          items={car ? [car?.result.thumb, ...(car?.result.images ?? [])] : []}
          preview={{
            visible: showPreview,
            closeIcon: <CloseOutlined onClick={() => setShowPreview(false)} />,
          }}
        />
        <div
          className="absolute bg-white/90 backdrop-blur-sm rounded-full px-5 py-3 bottom-6 right-6 flex items-center gap-2 text-gray-800 cursor-pointer shadow-md hover:bg-white transition-all duration-300"
          onClick={() => {
            setShowPreview(true);
          }}
        >
          <ImageFilledIcon />
          <span className="font-medium">Xem tất cả ảnh</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 mt-10 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Car Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl m-0 font-bold text-gray-900">
                {car?.result.model.name} {car?.result.yearManufacture}
              </h1>

              {!liked ? (
                <button
                  className="p-3 border border-solid text-gray-500 rounded-full hover:bg-gray-50 transition-colors duration-300"
                  onClick={handleLikeClick}
                >
                  <HeartOutlined style={{ fontSize: "24px" }} />
                </button>
              ) : (
                <button
                  className="p-3 border border-solid rounded-full bg-red-50 hover:bg-red-100 transition-colors duration-300"
                  onClick={handleLikeClick}
                >
                  <HeartFilled style={{ fontSize: "24px", color: "#fb452b" }} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-gray-700">
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                <StarFilledIcon className="text-yellow-500" />
                <span className="font-medium">{car?.result.totalRatings}</span>
              </div>

              <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                <BagFilledIcon className="text-green-500" />
                <span className="font-medium">27 chuyến</span>
              </div>

              <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                <MapIcon className="text-blue-500" />
                <span className="font-medium">Hà Nội</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Tag className="rounded-full border-none bg-green-100 text-green-800 font-medium px-3 py-1">
                {car?.result.transmissions}
              </Tag>
            </div>
          </div>

          {/* Car Features */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Đặc điểm</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="bg-green-100 p-3 rounded-full">
                  <SeatIcon className="text-2xl text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Số ghế</span>
                  <span className="font-bold text-lg">
                    {car?.result.numberSeat}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="bg-green-100 p-3 rounded-full">
                  <TransmissionIcon className="text-2xl text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Truyền động</span>
                  <span className="font-bold text-lg">
                    {car?.result.transmissions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Car Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Mô tả</h2>
            <p className="text-gray-700 leading-relaxed">
              {car?.result.description}
            </p>
          </div>

          {/* Car Amenities */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Các tiện nghi khác
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
              {carServices.map(({ icon: Icon, name }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Icon className="text-xl text-blue-600" />
                  </div>
                  <span className="font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Requirements */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Giấy tờ thuê xe
            </h2>
            <div className="bg-amber-50 border-transparent rounded-xl p-5 border-solid border-l-4 border-l-amber-600">
              <h4 className="flex items-center gap-2 text-gray-800 m-0 font-medium">
                <InfoIcon className="text-amber-600" />
                <span>Chọn 1 trong 2 hình thức</span>
              </h4>
              <div className="mt-4 font-medium flex flex-col gap-4">
                <div className="flex gap-3 items-center bg-white p-3 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <IdCardIcon className="text-xl text-green-600" />
                  </div>
                  <span>GPLX & CCCD gắn chip (đối chiếu)</span>
                </div>
                <div className="flex gap-3 items-center bg-white p-3 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <DriverLicenceIcon className="text-xl text-green-600" />
                  </div>
                  <span>GPLX (đối chiếu) & Passport (giữ lại)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Điều khoản</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span>Sử dụng xe đúng mục đích.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span>
                  Không sử dụng xe thuê vào mục đích phi pháp, trái pháp luật.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span>Không sử dụng xe thuê để cầm cố, thế chấp.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span>Không hút thuốc, nhả kẹo cao su, xả rác trong xe.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span>Không chở hàng quốc cấm dễ cháy nổ.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span>Không chở hoa quả, thực phẩm nặng mùi trong xe.</span>
              </li>
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Chính sách hủy chuyến
            </h2>
            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <InfoIcon className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">
                Miễn phí hủy chuyến trong vòng 1 giờ sau khi đặt cọc
              </span>
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Đánh giá</h2>
            <div className="flex flex-col gap-6">
              {ratings?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page?.result.map((rating, index) => (
                    <Feedback key={index} dataRatings={rating} />
                  ))}
                </React.Fragment>
              ))}
              {hasNextPage && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-1/3 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 border-none text-gray-700 font-medium"
                  >
                    {isFetchingNextPage ? "Đang tải..." : "Đọc thêm"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sticky top-6">
            {/* Insurance */}
            <div className="flex gap-4 bg-white border border-solid rounded-xl border-gray-200 p-5 items-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-green-100 p-3 rounded-full">
                <ShieldCheckOutlineIcon className="text-green-600 text-xl" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg text-green-600 font-bold">
                  Hỗ trợ bảo hiểm với VNI
                </span>
                <span className="font-medium text-xs text-gray-700 hover:text-green-600 cursor-pointer transition-colors">
                  Xem chi tiết
                </span>
              </div>
            </div>

            {/* Booking Card */}
            <div className="flex flex-col gap-6 bg-white border border-solid rounded-xl border-gray-200 p-6 mt-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {car?.result?.cost?.toLocaleString("it-IT", {
                    style: "currency",
                    currency: "VND",
                  })}
                </h2>
                <span className="text-gray-600 font-medium">/ngày</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  Chọn thời gian thuê
                </h3>
                <DateRangePicker
                  showTime={{ format: "HH:mm" }}
                  format="DD-MM-YYYY HH:mm"
                  disabledTime={disabledRangeTime}
                  disabledDate={disabledDate}
                  className="w-full"
                  onChange={handleDateChange}
                />
                {validationMessage && (
                  <p className="text-red-500 mt-2 text-sm">
                    {validationMessage}
                  </p>
                )}
              </div>

              <Button
                type="primary"
                onClick={handleRent}
                className="h-12 text-base font-medium rounded-full bg-green-600 hover:bg-green-700"
                size="large"
              >
                Chọn thuê
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <InfoIcon className="text-gray-400" />
                <span>Xem trước thời gian mà bạn muốn thuê</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Modal
        title="Bạn cần đăng nhập để thuê xe"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        className="rounded-xl overflow-hidden"
      >
        <p className="my-4 text-gray-600">
          Vui lòng đăng nhập để tiếp tục thuê xe.
        </p>
        <Link href="/login">
          <Button
            type="primary"
            className="mt-2 h-10 rounded-full bg-green-600 hover:bg-green-700"
          >
            Đăng nhập
          </Button>
        </Link>
      </Modal>

      {/* License Verification Modal */}
      <Modal
        title="Giấy phép lái xe chưa được xác thực"
        open={isModalCheckOpen}
        onOk={handleOk1}
        onCancel={handleCancel1}
        footer={false}
        className="rounded-xl overflow-hidden"
      >
        <p className="my-4 text-gray-600">
          Giấy phép lái xe của bạn chưa được xác thực, vui lòng liên hệ với nhân
          viên để được hỗ trợ.
        </p>
        <Link href="/profile">
          <Button
            type="primary"
            className="mt-2 h-10 rounded-full bg-green-600 hover:bg-green-700"
          >
            Đến trang cá nhân
          </Button>
        </Link>
      </Modal>
    </div>
  );
}
