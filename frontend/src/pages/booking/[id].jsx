import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
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
  console.log(from, to);
  const onChange = (e) => {
    setCostGetCar(e.target.value);
  };

  const [result, setResult] = useState("");
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();

  const status = router.query?.status;
  const codeTransaction = router.query?.apptransid;
  const totalCost = router?.query?.amount;

  const [startDate, endDate] = dates || [null, null];

  const [totalDays, setTotalDays] = useState(
    Math.ceil(endDate?.diff(startDate, "hours") / 24)
  );
  const [accessToken] = useLocalStorage("access_token");

  // Lấy thông tin đơn hàng từ query string
  const orderInfo = router.query?.vnp_OrderInfo
    ? router.query.vnp_OrderInfo.split(",:?")
    : [];

  useEffect(() => {
    if (router.query.status) {
      if (router.query.status === "1") {
        const bookedCar = async () => {
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/bookings/${orderInfo[0]}`,
              {
                codeTransaction: codeTransaction,
                totalCost: totalCost,
                phone: orderInfo[1] || "",
                address: orderInfo[2] || "",
                timeBookingStart: orderInfo[3] || "",
                timeBookingEnd: orderInfo[4] || "",
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );
            console.log("BOOKING SUCCESS:", response.data.result);
          } catch (error) {
            console.error("BOOKING ERROR:", error);
          }
        };
        bookedCar();
        setResult("Giao Dịch thành công");
      } else {
        deleteBookedTimeSlots(accessToken, carId, {
          timeBookingStart: orderInfo[3],
          timeBookingEnd: orderInfo[4],
        });
      }
      setCurrent(2);
    }
  }, [router?.query?.status]);

  const { data, error } = useQuery({
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
        console.log(response.data.result);
        return response.data.result;
      } catch (error) {
        console.log(error);
      }
    },
  });

  const onSubmit = async (values) => {
    try {
      // Gửi yêu cầu đặt lịch
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

      if (response2.status !== 200) {
        return message.error(
          "Thời gian đã được chọn. Vui lòng chọn ngày khác!"
        );
      }

      console.log("Booking response:", response2);

      // Gửi yêu cầu thanh toán
      const requestData = { ...values, from, to, id: data?._id };
      console.log("From" + from + "To : " + to); // Kiểm tra dữ liệu trước khi gửi

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/payments/zalopay_payment_url`,
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200 && response.data?.data?.order_url) {
        window.location.assign(response.data.data.order_url);
      } else {
        message.error("Không tìm thấy đường dẫn thanh toán.");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error(error.response?.data?.message || "Đã xảy ra lỗi.");
    }
  };

  const { mutate } = useMutation(onSubmit);
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

  const result1 = useQuery({
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
          ? "Km 29, trường đại học FPT, xã Thạch Hoà, huyện Thạch Thất, Hà Nội"
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
      console.log(from);
      console.log(to);
      setTotalDays(Math.ceil(value[1]?.diff(value[0], "hours") / 24));
    }
  };

  const handleCheckout = () => {
    if (from == undefined || to == undefined) {
      setValidationMessage("Hãy chọn ngày thuê");
    } else if (validationMessage === "Khoảng ngày đã được thuê.") {
      message.error("Khoảng ngày đã được thuê. Vui lòng chọn ngày khác!");
    } else {
      setTotalDays(totalDays);
      setCurrent(1);
    }
  };
  //
  const applyCoupon = (coupon) => {
    const discount = coupon?.discount || 0;
    setAmountDiscount(discount);
  };

  return (
    <div className="mb-10 max-w-6xl mx-auto">
      <>
        <div class="flex flex-col mt-10 items-center justify-center border rounded-sm shadow-md bg-slate-100 p-2 pb-4 sm:flex-row sm:px-5 lg:px-5 xl:px-12">
          <div class="flex  w-full mt-4 py-2 text-xs sm:mt-0 sm:ml-auto sm:text-base ">
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
          <div class="grid sm:px- mt-3 lg:grid-cols-2 p-6 rounded-sm shadow-md  bg-slate-100 ">
            <div class="px-10 pt-8 ">
              <p class="text-xl font-medium">Tổng kết đơn hàng</p>
              <p class="text-gray-400"></p>
              <div class="mt-8 space-y-3 rounded-lg shadow-md border bg-white px-2 py-4 sm:px-6">
                <div class="flex flex-col rounded-lg bg-white sm:flex-row relative">
                  <div className="relative rounded-lg w-1/2">
                    <Image
                      alt="car"
                      src={data?.thumb}
                      layout="fill"
                      className="rounded-lg"
                    />
                  </div>

                  <div class="flex w-full flex-col px-4 py-4">
                    <span class="font-semibold text-lg">
                      {data?.model?.name} {data?.yearManufacture}
                    </span>
                    <span class="float-right text-gray-400">
                      {data?.transmissions} - {data?.numberSeat}
                    </span>
                    <p class="text-lg font-bold ">
                      {" "}
                      {data?.cost.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "VND",
                      })}
                      /ngày
                    </p>
                  </div>
                </div>
              </div>

              <p class="mt-8 text-lg font-medium">Phương thức nhận xe</p>
              <form class="mt-5 mb-5 grid gap-6">
                <Radio.Group onChange={onChange} value={costGetCar}>
                  <Space direction="vertical">
                    <Radio value={0}>
                      Km 29, trường đại học FPT, xã Thạch Hoà, huyện Thạch Thất,
                      Hà Nội
                    </Radio>
                    <Radio value={150000}>
                      Giao Tận nơi trong Thành phố Hà Nội (thêm 150k)
                    </Radio>
                  </Space>
                </Radio.Group>
              </form>
            </div>
            <div class="mt-14 bg-gray-50 px-10 pt-4 lg:mt-5 rounded-md shadow-md">
              <p class="text-xl font-medium">Thông tin thuê chi tiết</p>
              <p class="text-gray-400">Thời gian thuê xe</p>
              <Space direction="vertical" size={12}>
                <RangePicker
                  showTime={{ format: "HH:mm" }}
                  format="DD-MM-YYYY HH:mm"
                  onChange={selectTimeSlots}
                  size="large"
                  disabledDate={disabledDate}
                  disabledTime={disabledRangeTime}
                  defaultValue={[startDate, endDate]}

                  // locale={locale}
                />
                {validationMessage && (
                  <p className="text-red-500">{validationMessage}</p>
                )}
              </Space>
              <p class="text-gray-400">Tổng Số ngày thuê: {totalDays} </p>
              <p class="text-gray-400">
                Giá 1 ngày thuê:{" "}
                {data?.cost.toLocaleString("it-IT", {
                  style: "currency",
                  currency: "VND",
                }) || 0}
              </p>
              <Coupon applyCoupon={applyCoupon} />
              <p className="text-lg">
                Tổng giá thuê:{" "}
                {(
                  totalDays * data?.cost +
                    costGetCar -
                    ((totalDays * data?.cost + costGetCar) * amountDiscount) /
                      100 || 0
                ).toLocaleString("it-IT", {
                  style: "currency",
                  currency: "VND",
                })}
              </p>

              <button
                onClick={handleCheckout}
                className="mt-4 mb-2 w-full border-none  rounded-md bg-green-400 hover:bg-green-600 px-6 py-2 text-lg font-bold text-white cursor-pointer"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {current === 1 && (
          <Form
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 20,
            }}
            layout="horizontal"
            name="basic"
            initialValues={{
              amount: "0",
              fullname: `${user?.result?.fullname || ""}`,
              phone: `${user?.result?.phoneNumber || ""}`,
            }}
            size="large"
            className=""
          >
            <div className="grid sm:px-10 lg:grid-cols-2 p-5 mt-3 rounded-md  shadow-md  bg-slate-100">
              <div class=" pt-8 pr-10 ">
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
                  <Input />
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
                  <Input />
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
                  <TextArea readOnly rows={3} placeholder="Địa chỉ giao xe" />
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
                    style={{ color: "white" }}
                  />
                </Form.Item>
                <Form.Item name="amount" label="Số tiền:">
                  <Input readOnly />
                </Form.Item>
              </div>
              <div class="mt-14 bg-gray-50 px-10 pt-8 lg:mt-5 rounded-md shadow-md">
                <Form.Item name="bankCode" label="Thanh toán:">
                  <Radio.Group name="bankCode" className="mt-2">
                    <Space direction="vertical">
                      <Radio value="" checked={true}>
                        Cổng thanh toán ZALOPAY
                      </Radio>
                      {/* <Radio name="bankCode" value="VNPAYQR">
                        Thanh toán qua ứng dụng hỗ trợ VNPAYQR
                      </Radio>
                      <Radio name="bankCode" value="VNBANK">
                        Thanh toán qua ATM-Tài khoản ngân hàng nội địa
                      </Radio>
                      <Radio name="bankCode" value="INTCARD">
                        Thanh toán qua thẻ quốc tế
                      </Radio> */}
                    </Space>
                  </Radio.Group>
                </Form.Item>

                {/* <Form.Item name="language" label="Ngôn ngữ:">
                  <Radio.Group name="language" className="mt-2">
                    <Space direction="vertical">
                      <Radio value="vn">Tiếng việt</Radio>
                      <Radio value="en">Tiếng anh</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item> */}

                <Form.Item>
                  <Space direction="horizontal" className="ml-12">
                    <Button type="primary" htmlType="submit">
                      Thanh Toán
                    </Button>
                    <Button type="dashed" onClick={handleBack}>
                      Trở về thủ tục thanh toán
                    </Button>
                  </Space>
                </Form.Item>
              </div>
            </div>
          </Form>
        )}
      </>

      {current === 2 && (
        <div className="flex justify-center items-start mt-5 text-gray-700">
          {router.query.status === "1" ? (
            <div className="flex flex-col justify-center items-center mt-5 text-gray-700">
              <CheckCircleOutlined
                style={{ fontSize: "35px", color: "#22c12a" }}
              />

              <h1>{result}</h1>
              <Link href="/">
                <Button type="primary">Trở về trang chủ</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center mt-5 text-gray-700">
              <CloseCircleOutlined
                style={{ fontSize: "35px", color: "#c12222" }}
              />

              <h1>{result}</h1>
              <Link href="/">
                <Button type="primary">Trở về trang chủ</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default BookingPage;
