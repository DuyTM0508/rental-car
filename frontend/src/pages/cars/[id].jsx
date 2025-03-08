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

import moment from "moment-timezone";
import { Button, Divider, Table, Tag, Modal, message } from "antd";
import Image from "next/image";
import { Image as AntImage } from "antd";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDatesState } from "@/recoils/dates.state";
import { useUserState } from "@/recoils/user.state";
import {
  HeartOutlined,
  HeartFilled,
  CloseOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { GET_CAR_DETAILS } from "@/constants/react-query-key.constant";
import { getCarDetail, likeCars } from "@/apis/user-cars.api";
import { useRatingsOfCar } from "@/hooks/useGetRatings";
import { apiClient } from "@/apis/client";
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
  console.log(liked);
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
          console.log(data);
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
    } else if (user?.result?.driverLicenses === undefined) {
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
      console.log(bookedStart, bookedEnd);

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
    console.log(dates);
    setDates(dates);
  };
  // const range = (start, end) => {
  //   const result = [];
  //   for (let i = start; i < end; i++) {
  //     result.push(i);
  //   }
  //   return result;
  // };

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

  // const { data: ratings } = useQuery({
  //   queryKey: [GET_RATINGS_OF_CAR, carId],
  //   queryFn: () => getRatingsOfCar(carId),
  // });

  const {
    data: ratings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRatingsOfCar(carId);

  console.log(ratings);

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
  }, [carId]);

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
        console.log(response.data.result);
        setBookedTimeSlots(response.data.result);
        return response.data.result;
      } catch (error) {
        console.log(error);
      }
    },
  });

  console.log({ showPreview });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid h-[600px] gap-4 grid-cols-4 grid-rows-3 relative">
        <div className="relative col-span-3 row-span-3 rounded-md overflow-hidden">
          <Image alt="car" src={car?.result.thumb} layout="fill" />
        </div>
        <div className="relative rounded-md overflow-hidden">
          <Image alt="car" src={car?.result.images[0]} layout="fill" />
        </div>
        <div className="relative rounded-md overflow-hidden">
          <Image alt="car" src={car?.result.images[1]} layout="fill" />
        </div>
        <div className="relative rounded-md overflow-hidden">
          <Image alt="car" src={car?.result.images[2]} layout="fill" />
        </div>

        <AntImage.PreviewGroup
          items={car ? [car?.result.thumb, ...(car?.result.images ?? [])] : []}
          preview={{
            visible: showPreview,
            closeIcon: <CloseOutlined onClick={() => setShowPreview(false)} />,
          }}
        />
        <div
          className="absolute bg-white rounded-md px-4 py-2 bottom-4 right-4 flex items-center gap-2 text-gray-800 cursor-pointer"
          onClick={() => {
            setShowPreview(true);
          }}
        >
          <ImageFilledIcon />
          Xem tất cả ảnh
        </div>
      </div>

      <div className="grid grid-cols-5 mt-10 gap-4">
        <div className="col-span-3">
          <div className="flex justify-between">
            <h1 className="text-4xl m-0 font-bold">
              {car?.result.model.name} {car?.result.yearManufacture}
            </h1>

            {!liked ? (
              <HeartOutlined
                className="p-3 border border-solid text-gray-500 rounded-full"
                style={{ fontSize: "24px" }}
                onClick={handleLikeClick}
              />
            ) : (
              <HeartFilled
                className="p-3 border border-solid rounded-full"
                style={{ fontSize: "24px", color: "#fb452b" }}
                onClick={handleLikeClick}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-gray-800">
            <div className="flex items-center gap-1">
              <StarFilledIcon className="text-yellow-500" />
              <span>{car?.result.totalRatings}</span>
            </div>

            <div className="flex items-center gap-1">
              <BagFilledIcon className="text-green-500" />
              <span>27 chuyến</span>
            </div>

            <div>Ngũ Hành Sơn, Đà Nẵng</div>
          </div>

          <div className="flex gap-2 mt-4">
            <Tag className="rounded-full border-none bg-green-100">
              {car?.result.transmissions}
            </Tag>
            {/* <Tag className="rounded-full border-none bg-rose-100">
              Đặt xe nhanh
            </Tag> */}
          </div>

          <Divider />

          <div>
            <h2 className="font-medium">Đặc điểm</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-6">
                <SeatIcon className="shrink-0 text-2xl text-green-500" />
                <div className="flex flex-col items-center text-base">
                  <span className="text-gray-800">Số ghê</span>
                  <span className="font-bold">{car?.result.numberSeat}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <TransmissionIcon className="shrink-0 text-2xl text-green-500" />
                <div className="flex flex-col items-center text-base">
                  <span className="text-gray-800">Truyền động</span>
                  <span className="font-bold">
                    {" "}
                    {car?.result.transmissions}
                  </span>
                </div>
              </div>

              {/* <div className="flex items-center gap-4">
                <GasIcon className="shrink-0 text-2xl text-green-500" />
                <div className="flex flex-col items-center text-base">
                  <span className="text-gray-800">Nhiên liệu</span>
                  <span className="font-bold">Xăng</span>
                </div>
              </div> */}
            </div>
          </div>

          <Divider />

          <div>
            <h2 className="font-medium">Mô tả</h2>
            <p>{car?.result.description}</p>
          </div>

          <Divider />

          <div>
            <h2 className="font-medium">Các tiện nghi khác</h2>
            <div className="grid grid-cols-3 gap-x-y gap-y-8">
              {carServices.map(({ icon: Icon, name }) => (
                <div key={name} className="flex items-center gap-3">
                  <Icon className="text-xl" />
                  {name}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-medium">Giấy tờ thuê xe</h2>
            <div className="bg-amber-100 border-transparent rounded-md p-4 border-solid border-l-4 border-l-amber-600">
              <h4 className="flex items-center gap-1 text-gray-800 m-0 font-medium">
                <InfoIcon />
                <span>Chọn 1 trong 2 hình thức</span>
              </h4>
              <div className="mt-4 font-bold flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <IdCardIcon className="text-xl" />
                  <span>GPLX & CCCD gắn chip (đối chiếu)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <DriverLicenceIcon className="text-xl" />
                  <span>GPLX (đối chiếu) & Passport (giữ lại)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-medium">Điều khoản</h2>
            <ul>
              <li>Sử dụng xe đúng mục đích.</li>
              <li>
                Không sử dụng xe thuê vào mục đích phi pháp, trái pháp luật.
              </li>
              <li>Không sử dụng xe thuê để cầm cố, thế chấp.</li>
              <li>Không hút thuốc, nhả kẹo cao su, xả rác trong xe.</li>
              <li>Không chở hàng quốc cấm dễ cháy nổ.</li>
              <li>Không chở hoa quả, thực phẩm nặng mùi trong xe.</li>
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="font-medium">Chính sách hủy chuyến</h2>
            <div>Miễn phí hủy chuyến trong vòng 1 giờ sau khi đặt cọc</div>
          </div>

          <Divider />

          <div className="mt-10 max-w">
            <h2 className="font-medium">Đánh giá</h2>
            <div className="flex flex-col gap-4">
              {ratings?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page?.result.map((rating, index) => (
                    <Feedback key={index} dataRatings={rating} />
                  ))}
                </React.Fragment>
              ))}
              {hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-1/5 p-5 flex items-center justify-center"
                  >
                    {isFetchingNextPage ? "Đang tải..." : "Đọc thêm"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 ">
          <div className="flex gap-4 border border-solid rounded-lg border-gray-300 p-4 items-center">
            <ShieldCheckOutlineIcon className="text-green-500" />
            <div className="flex flex-col gap-2">
              <span className="text-lg text-green-500 font-bold">
                Hỗ trợ bảo hiểm với VNI
              </span>
              <span className="font-medium text-xs text-gray-900">
                Xem chi tiết
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-solid rounded-lg border-gray-300 p-4 bg-green-50 mt-10">
            <h1>
              {car?.result?.cost?.toLocaleString("it-IT", {
                style: "currency",
                currency: "VND",
              })}
              /ngày
            </h1>
            <DateRangePicker
              showTime={{ format: "HH:mm" }}
              format="DD-MM-YYYY HH:mm"
              // defaultValue={[
              //   dayjs(from, "DD-MM-YYYY HH:mm"),
              //   dayjs(to, "DD-MM-YYYY HH:mm"),
              // ]}
              disabledTime={disabledRangeTime}
              disabledDate={disabledDate}
              className="rounded-full"
              onChange={handleDateChange}
            />
            {validationMessage && (
              <p className="text-red-500 ml-2">{validationMessage}</p>
            )}
            <div className="flex justify-center ">
              {/* <Link href={`/booking/${car?.result._id}`}> */}
              <Button type="primary" onClick={handleRent}>
                Chọn thuê
              </Button>
              {/* </Link> */}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Bạn cần đăng nhập để thuê xe"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
      >
        <Link href="/login ">
          <Button type="primary" className="mt-5">
            Login
          </Button>
        </Link>
      </Modal>

      <Modal
        title="Bạn cần xác thực giấy phép lái xe để thuê xe"
        open={isModalCheckOpen}
        onOk={handleOk1}
        onCancel={handleCancel1}
        footer={false}
      >
        <Link href="/profile ">
          <Button type="primary" className="mt-5">
            Profile
          </Button>
        </Link>
      </Modal>
    </div>
  );
}
