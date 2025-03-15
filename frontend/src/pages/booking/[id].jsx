import moment from "moment-timezone";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SolutionOutlined,
  PayCircleOutlined,
  SmileOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  Typography,
  Steps,
  Radio,
  Space,
  DatePicker,
  message,
} from "antd";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useDatesState } from "@/recoils/dates.state";
import { useUserState } from "@/recoils/user.state";
import { deleteBookedTimeSlots } from "@/apis/user-bookings.api";
import Coupon from "@/components/Coupon";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const BookingPage = () => {
  const [user] = useUserState();
  const router = useRouter();
  const { query } = useRouter();
  const carId = query?.id || "6539111ff01c77b98e74364a";

  const [costGetCar, setCostGetCar] = useState(0);
  const [amountDiscount, setAmountDiscount] = useState(0);
  const [dates, setDates] = useDatesState();

  const [from, setFrom] = useState(
    moment(dates?.[0]?.format("YYYY-MM-DD HH:mm") || undefined)._i
  );
  const [to, setTo] = useState(
    moment(dates?.[1]?.format("YYYY-MM-DD HH:mm") || undefined)._i
  );
  const onChange = (e) => {
    setCostGetCar(e.target.value);
  };

  const [result, setResult] = useState("");
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [startDate, endDate] = dates || [null, null];
  const [totalDays, setTotalDays] = useState(
    Math.ceil(endDate?.diff(startDate, "hours") / 24)
  );
  const order = router.query?.vnp_OrderInfo;
  const orderInfo = order ? order.split(",:?") : []; // Khởi tạo mặc định là mảng rỗng nếu order undefined
  const [accessToken] = useLocalStorage("access_token");

  // Hàm lưu booking
  const saveBooking = async () => {
    const codeTransaction = paymentInfo?.id || carId;
    const totalCost =
      paymentInfo?.amount ||
      (totalDays * data?.cost +
        costGetCar -
        ((totalDays * data?.cost + costGetCar) * amountDiscount) / 100) /
        100;
    const timeTransaction =
      paymentInfo?.createdAt || moment().format("YYYYMMDDHHmmss");

    // Lấy thông tin từ form nếu orderInfo không có dữ liệu
    const formValues = form.getFieldsValue();
    const phone =
      orderInfo[1] || formValues.phone || user?.result?.phoneNumber || "";
    const address =
      orderInfo[2] || formValues.address || user?.result?.address || "";
    const timeBookingStart = orderInfo[3] || from;
    const timeBookingEnd = orderInfo[4] || to;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/bookings/${carId}`,
        {
          codeTransaction,
          totalCost,
          timeTransaction,
          phone,
          address,
          timeBookingStart,
          timeBookingEnd,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Booking saved:", response.data.result);
      return response.data.result;
    } catch (error) {
      console.error("Error saving booking:", error);
      throw error;
    }
  };

  // Chỉ lưu booking khi result là "Giao Dịch thành công"
  useEffect(() => {
    if (result === "Giao dịch thành công" && paymentInfo) {
      saveBooking().catch((error) => {
        setResult("Lỗi khi lưu booking, vui lòng liên hệ hỗ trợ");
      });
    }
  }, [result, paymentInfo]);

  const { data } = useQuery({
    queryKey: ["getCar", carId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/cars/${carId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        return response.data.result;
      } catch (error) {
        console.log(error);
      }
    },
  });

  const onSubmit = async (values) => {
    try {
      const response2 = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/bookings/bookRecord/${carId}`,
        { timeBookingStart: from, timeBookingEnd: to },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response2.status === 500) {
        message.error("Thời gian đã được chọn. Vui lòng chọn ngày khác!");
        return;
      }

      const totalBeforeDiscount = totalDays * data?.cost + costGetCar;
      const totalAmount =
        totalBeforeDiscount - (totalBeforeDiscount * amountDiscount) / 100;

      const items = [
        {
          name: data?.model?.name,
          quantity: totalDays,
          price: totalAmount,
        },
      ];

      const currentUrl =
        typeof window !== "undefined" ? window.location.href : "";

      let response;

      // Handle different payment methods
      if (values.paymentMethod === "zalopay") {
        // Use ZaloPay API with required fields from the controller
        const totalBeforeDiscount = totalDays * data?.cost + costGetCar;
        const discountAmount = (totalBeforeDiscount * amountDiscount) / 100;

        response = await axios.post(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/payments/zalopay_payment_url`,
          {
            name: values.fullname,
            phone: values.phone,
            address: values.address,
            from: from,
            to: to,
            id: carId,
            amount: totalBeforeDiscount,
            discount: discountAmount,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // Default to PayOS
        const totalBeforeDiscount = totalDays * data?.cost + costGetCar;
        const totalAmount =
          totalBeforeDiscount - (totalBeforeDiscount * amountDiscount) / 100;

        const items = [
          {
            name: data?.model?.name,
            quantity: totalDays,
            price: totalAmount,
          },
        ];

        const currentUrl =
          typeof window !== "undefined" ? window.location.href : "";

        response = await axios.post(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/payments/create_payment_url`,
          { currentUrl, totalAmount, items },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (response.data && response.data.checkoutUrl) {
        window.location.assign(response.data.checkoutUrl);
      } else if (response.request && response.request.responseURL) {
        window.location.assign(response.request.responseURL);
      } else {
        console.error("Không tìm thấy URL chuyển hướng");
        message.error("Không tìm thấy URL thanh toán");
      }
    } catch (error) {
      console.error("Lỗi khi tạo payment link:", error);
      message.error(
        error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại sau"
      );
    }
  };

  const { mutate } = useMutation(onSubmit);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");

  function isDateBooked(startDate, endDate) {
    for (const slot of bookedTimeSlots) {
      const bookedStart = moment(slot.from);
      const bookedEnd = moment(slot.to);
      if (bookedStart >= startDate && bookedEnd <= endDate) return true;
    }
    return false;
  }

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

  const { data: scheduledData, refetch: refetchSchedule } = useQuery({
    queryKey: ["getScheduleCar", carId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/bookings/${carId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
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

  useEffect(() => {
    const newAmount =
      totalDays * data?.cost +
        costGetCar -
        ((totalDays * data?.cost + costGetCar) * amountDiscount) / 100 || 0;

    form.setFieldsValue({
      amount: newAmount || 0,
      address:
        costGetCar === 0
          ? "Trường đại học FPT, Km 29 Đại lộ Thăng Long, Thạch Thất, Hà Nội (công ty CRT)"
          : `${user?.result?.address || ""}`,
    });
  }, [totalDays, data?.cost, costGetCar, amountDiscount]);

  const handleBack = () => {
    setFrom(null);
    setTo(null);
    setDates(null);
    setTotalDays(0);
    setAmountDiscount(0);
    setCurrent(0);
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

  const selectTimeSlots = (value) => {
    if (value && value.length === 2) {
      const [startDate, endDate] = value;
      if (isDateBooked(startDate, endDate)) {
        setValidationMessage("Khoảng ngày đã được thuê.");
      } else {
        setValidationMessage("");
      }
      setFrom(moment(value[0]?.format("YYYY-MM-DD HH:mm") || "")._i);
      setTo(moment(value[1]?.format("YYYY-MM-DD HH:mm") || "")._i);
      setTotalDays(Math.ceil(value[1]?.diff(value[0], "hours") / 24));
    }
  };

  const handleCheckout = () => {
    if (from === undefined || to === undefined) {
      setValidationMessage("Hãy chọn ngày thuê");
    } else if (validationMessage === "Khoảng ngày đã được thuê.") {
      message.error("Khoảng ngày đã được thuê. Vui lòng chọn ngày khác!");
    } else {
      setCurrent(1);
    }
  };

  const applyCoupon = (coupon) => {
    const discount = coupon?.discount || 0;
    setAmountDiscount(discount);
  };

  useEffect(() => {
    if (!router.isReady) return;

    const { cancel, status } = router.query;

    // Lấy toàn bộ URL hiện tại
    const fullUrl = router.asPath;
    console.log("Full URL:", fullUrl);

    // Trích xuất currentId từ URL
    const idMatch = fullUrl.match(/&id=([^&]*)/);
    const currentId = idMatch ? idMatch[1] : null;
    console.log("Extracted currentId:", currentId);

    if (cancel && status) {
      if (cancel === "true" && status === "CANCELLED") {
        setResult("Giao dịch thất bại");
        deleteBookedTimeSlots(accessToken, carId, {
          timeBookingStart: from,
          timeBookingEnd: to,
        });
      } else {
        setResult("Giao dịch thành công");
        // Gọi API bất đồng bộ để lấy thông tin payment link
        const fetchPaymentInfo = async () => {
          if (!currentId) {
            console.error("No currentId extracted from URL");
            setResult("Lỗi: Không tìm thấy orderId trong URL");
            return;
          }

          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/payments/get_payment`,
              {
                params: { orderId: currentId },
                headers: { "Content-Type": "application/json" },
              }
            );
            console.log("Checkout response:", response.data);
            setPaymentInfo(response.data); // Lưu response vào state
          } catch (error) {
            console.error("Error fetching payment info:", error);
            setResult("Lỗi khi lấy thông tin thanh toán");
          }
        };
        fetchPaymentInfo();
      }
      setCurrent(2);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (result === "Giao dịch thành công" && paymentInfo) {
      saveBooking()
        .then(() => {
          // Refetch the scheduled time slots after successful booking
          refetchSchedule();
        })
        .catch((error) => {
          setResult("Lỗi khi lưu booking, vui lòng liên hệ hỗ trợ");
        });
    }
  }, [result, paymentInfo]);

  return (
    <div className="mb-10 max-w-6xl mx-auto">
      <>
        <div className="flex flex-col mt-10 items-center justify-center border rounded-sm shadow-md bg-slate-100 p-2 pb-4 sm:flex-row sm:px-5 lg:px-5 xl:px-12">
          <div className="flex w-full mt-4 py-2 text-xs sm:mt-0 sm:ml-auto sm:text-base">
            <Steps
              className="mt-5"
              current={current}
              items={[
                {
                  title: "Thủ tục thanh toán",
                  icon: <SolutionOutlined />,
                },
                {
                  title: "Thanh toán",
                  icon:
                    current === 1 ? <LoadingOutlined /> : <PayCircleOutlined />,
                },
                {
                  title: "Kết quả",
                  icon: <SmileOutlined />,
                },
              ]}
            />
          </div>
        </div>
        {current === 0 && (
          <div className="grid sm:px- mt-3 lg:grid-cols-2 gap-6 p-6 rounded-lg shadow-md bg-slate-100">
            <div className="px-6 pt-6">
              <h2 className="text-xl font-semibold mb-6">Tổng kết đơn hàng</h2>
              <div className="space-y-6 rounded-lg shadow-md border bg-white px-4 py-5">
                <div className="flex flex-col rounded-lg bg-white sm:flex-row relative">
                  <div
                    className="relative rounded-lg w-full sm:w-1/2"
                    style={{ height: "200px" }}
                  >
                    <Image
                      alt="car"
                      src={data?.thumb || "/placeholder.svg"}
                      layout="fill"
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex w-full flex-col px-4 py-4">
                    <span className="font-semibold text-lg">
                      {data?.model?.name} {data?.yearManufacture}
                    </span>
                    <span className="text-gray-400">
                      {data?.transmissions} - {data?.numberSeat} chỗ
                    </span>
                    <div className="mt-2 flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-4 h-4 text-yellow-500 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm ml-1">(4.8)</span>
                    </div>
                    <p className="text-lg font-bold mt-auto">
                      {data?.cost.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                      <span className="text-sm font-normal text-gray-500">
                        /ngày
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-semibold mt-8 mb-4">
                Phương thức nhận xe
              </h2>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <Radio.Group
                  onChange={onChange}
                  value={costGetCar}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <Radio value={0} className="w-full pb-3 border-b">
                      <div className="flex flex-col">
                        <span className="font-medium">Nhận tại văn phòng</span>
                        <span className="text-gray-500 text-sm">
                          Trường đại học FPT, Km 29 Đại lộ Thăng Long, Thạch
                          Thất, Hà Nội (công ty CRT)
                        </span>
                      </div>
                    </Radio>
                    <Radio value={150000} className="w-full pt-2">
                      <div className="flex flex-col">
                        <span className="font-medium">Giao tận nơi</span>
                        <span className="text-gray-500 text-sm">
                          Giao xe tận nơi trong Thành phố Hà Nội (phụ phí
                          150.000₫)
                        </span>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
            <div className="bg-white px-6 py-6 lg:mt-0 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">
                Thông tin thuê chi tiết
              </h2>
              <div className="space-y-5">
                <div>
                  <p className="text-gray-700 mb-2 font-medium">
                    Thời gian thuê xe
                  </p>
                  <Space direction="vertical" size={12} className="w-full">
                    <RangePicker
                      showTime={{ format: "HH:mm" }}
                      format="DD-MM-YYYY HH:mm"
                      onChange={selectTimeSlots}
                      size="large"
                      disabledDate={disabledDate}
                      disabledTime={disabledRangeTime}
                      defaultValue={[startDate, endDate]}
                      className="w-full"
                    />
                    {validationMessage && (
                      <p className="text-red-500 text-sm">
                        {validationMessage}
                      </p>
                    )}
                  </Space>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Số ngày thuê:</span>
                    <span className="font-medium">{totalDays} ngày</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Giá thuê mỗi ngày:</span>
                    <span className="font-medium">
                      {data?.cost.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  {costGetCar > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Phí giao xe:</span>
                      <span className="font-medium">
                        {costGetCar.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <Coupon applyCoupon={applyCoupon} />

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Tổng tiền:</span>
                    <span className="font-bold text-xl text-green-600">
                      {(
                        totalDays * data?.cost +
                          costGetCar -
                          ((totalDays * data?.cost + costGetCar) *
                            amountDiscount) /
                            100 || 0
                      ).toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-6 w-full rounded-md bg-green-500 hover:bg-green-600 px-6 py-3 text-lg font-medium text-white cursor-pointer transition-colors"
                >
                  Tiếp tục thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
        {current === 1 && (
          <div className="p-5">
            <Form
              form={form}
              onFinish={(values) => {
                mutate(values);
              }}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              layout="vertical"
              name="basic"
              initialValues={{
                bankCode: "",
                language: "vn",
                amount: "0",
                fullname: `${user?.result?.fullname || ""}`,
                phone: `${user?.result?.phoneNumber || ""}`,
                paymentMethod: "payos", // Default payment method
              }}
              size="large"
              className=""
            >
              <div className="grid sm:px-10 lg:grid-cols-2 gap-8 p-5 mt-3 rounded-lg shadow-md bg-slate-100">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">
                    Thông tin thanh toán
                  </h2>
                  <Form.Item
                    name="fullname"
                    label="Họ và tên:"
                    rules={[
                      {
                        required: true,
                        message: "Họ và tên không được để trống",
                      },
                    ]}
                  >
                    <Input className="rounded-md" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại:"
                    rules={[
                      {
                        required: true,
                        message: "Số điện thoại không được để trống",
                      },
                    ]}
                  >
                    <Input className="rounded-md" />
                  </Form.Item>
                  <Form.Item
                    name="address"
                    label="Địa chỉ giao xe:"
                    rules={[
                      {
                        required: true,
                        message: "Địa chỉ không được để trống",
                      },
                    ]}
                  >
                    <TextArea
                      readOnly
                      rows={3}
                      placeholder="Địa chỉ giao xe"
                      className="rounded-md"
                    />
                  </Form.Item>
                  <Form.Item name="date" label="Thời gian thuê xe">
                    <RangePicker
                      showTime={{ format: "HH mm" }}
                      format="DD-MM-YYYY HH:mm"
                      onChange={selectTimeSlots}
                      defaultValue={[
                        dayjs(from || startDate, "YYYY-MM-DD HH:mm"),
                        dayjs(to || endDate, "YYYY-MM-DD HH:mm"),
                      ]}
                      disabled
                      style={{ width: "100%" }}
                      className="rounded-md"
                    />
                  </Form.Item>
                  <Form.Item name="amount" label="Tổng số tiền:">
                    <Input
                      readOnly
                      className="rounded-md font-semibold text-lg"
                    />
                  </Form.Item>
                </div>
                <div className="mt-10 bg-gray-50 px-6 py-8 lg:mt-0 rounded-lg shadow-md space-y-6">
                  <h2 className="text-xl font-semibold">
                    Phương thức thanh toán
                  </h2>

                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Xe thuê:</span>
                      <span className="font-medium">
                        {data?.model?.name} {data?.yearManufacture}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">{totalDays} ngày</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Giá thuê:</span>
                      <span className="font-medium">
                        {data?.cost.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "VND",
                        })}
                        /ngày
                      </span>
                    </div>
                    {amountDiscount > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-medium text-green-600">
                          -{amountDiscount}%
                        </span>
                      </div>
                    )}
                    <div className="border-t my-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Tổng cộng:</span>
                        <span className="font-bold text-lg">
                          {(
                            totalDays * data?.cost +
                              costGetCar -
                              ((totalDays * data?.cost + costGetCar) *
                                amountDiscount) /
                                100 || 0
                          ).toLocaleString("it-IT", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Form.Item
                    name="paymentMethod"
                    label="Chọn phương thức thanh toán:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phương thức thanh toán",
                      },
                    ]}
                  >
                    <Radio.Group className="w-full">
                      <div className="grid grid-cols-1 gap-4 w-full">
                        <Radio
                          value="payos"
                          className="border p-0 rounded-lg overflow-hidden hover:border-blue-500 transition-all [&.ant-radio-wrapper-checked]:border-blue-500 [&.ant-radio-wrapper-checked]:border-2"
                        >
                          <div className="flex items-center p-4 w-full cursor-pointer">
                            <div className="flex-1">
                              <div className="font-medium text-base">PayOS</div>
                              <div className="text-gray-500 text-sm">
                                Thanh toán an toàn qua cổng PayOS
                              </div>
                            </div>
                            <div className="w-16 h-10 relative flex items-center justify-center bg-white rounded-md p-1">
                              <Image
                                src="/placeholder.svg?height=30&width=60"
                                alt="PayOS"
                                width={60}
                                height={30}
                              />
                            </div>
                          </div>
                        </Radio>
                        <Radio
                          value="zalopay"
                          className="border p-0 rounded-lg overflow-hidden hover:border-blue-500 transition-all [&.ant-radio-wrapper-checked]:border-blue-500 [&.ant-radio-wrapper-checked]:border-2"
                        >
                          <div className="flex items-center p-4 w-full cursor-pointer">
                            <div className="flex-1">
                              <div className="font-medium text-base">
                                ZaloPay
                              </div>
                              <div className="text-gray-500 text-sm">
                                Thanh toán nhanh chóng qua ZaloPay
                              </div>
                            </div>
                            <div className="w-16 h-10 relative flex items-center justify-center bg-white rounded-md p-1">
                              <Image
                                src="/placeholder.svg?height=30&width=60"
                                alt="ZaloPay"
                                width={60}
                                height={30}
                              />
                            </div>
                          </div>
                        </Radio>
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        className="bg-green-500 hover:bg-green-600 h-12 text-base font-medium"
                        block
                      >
                        Thanh Toán Ngay
                      </Button>
                      <Button
                        type="default"
                        onClick={handleBack}
                        size="large"
                        className="h-10"
                        block
                      >
                        Trở về thủ tục thanh toán
                      </Button>
                    </div>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        )}
        {current === 2 && (
          <div className="flex justify-center items-center mt-10">
            <div className="bg-white rounded-lg shadow-md p-10 max-w-md w-full text-center">
              {result === "Giao dịch thành công" ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleOutlined
                      style={{ fontSize: "40px", color: "#22c12a" }}
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-green-600 mb-2">
                    {result}
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Cảm ơn bạn đã đặt xe. Chúng tôi sẽ liên hệ với bạn sớm nhất!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CloseCircleOutlined
                      style={{ fontSize: "40px", color: "#c12222" }}
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-red-600 mb-2">
                    {result}
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại
                    sau.
                  </p>
                </>
              )}
              <Link href="/">
                <Button type="primary" size="large" className="min-w-[200px]">
                  Trở về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default BookingPage;
