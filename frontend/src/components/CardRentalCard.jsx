import React from "react";
import { Button, Tag } from "antd";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/number.utils";
import moment from "moment";
import { useState } from "react";
import RatingModal from "./RatingModal";

export const CarRentalCard = ({ info, accessToken }) => {
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = React.useState(null);
  const [carId, setCarId] = React.useState(null);

  const showModal = (bookingId, carId) => {
    setBookingId(bookingId);
    setCarId(carId);
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div className=" flex flex-col border rounded-xl border-solid border-neutral-200 p-4 ">
      <div className="flex flex-row ">
        <div className="flex flex-col relative aspect-video cursor-pointer">
          <Image
            src={info?.carId?.thumb}
            alt="car"
            height={150}
            width={150}
            className="rounded-lg object-cover w-1/3"
          />
        </div>

        <div className="flex flex-col w-3/4 ml-5 justify-around">
          <div className="flex justify-between">
            <h5 className="text-xl line-clamp-1 font-bold ml-2 mt-0 m-0">
              {info?.carId?.model?.name} {info?.carId?.yearManufacture}
            </h5>
            <div>
              {info?.contract?.status === "Đã tất toán" ? (
                <Tag className="rounded-full text-base" color="green">
                  Đã hoàn thành
                </Tag>
              ) : info?.contract?.status === "Đang thực hiện" ? (
                <Tag className="rounded-full text-base" color="green">
                  Đang thuê
                </Tag>
              ) : info?.contract?.status === "Đã hủy" ||
                info?.status === "Đã hủy" ? (
                <Tag className="rounded-full text-base" color="red">
                  Đã hủy
                </Tag>
              ) : (
                <Tag className="rounded-full text-base" color="yellow">
                  Đang chờ
                </Tag>
              )}
            </div>
          </div>
          <h2 className="line-clamp-1 text-red-500 font-bold ml-2 m-0">
            {formatCurrency(info?.totalCost)}
          </h2>
          <div className="flex justify-between items-center">
            <div className="">
              <span className="line-clamp-1 font-normal ml-2">
                Ngày thuê: {moment(info?.timeBookingStart).format("DD-MM-YYYY")}
              </span>
              <span className="line-clamp-1 font-normal ml-2">
                Ngày trả: {moment(info?.timeBookingEnd).format("DD-MM-YYYY")}
              </span>
            </div>
            <div className="flex gap-4">
              <Link href={`/profile/detail-booking/${info?._id}`}>
                <Button className="" type="primary ">
                  Chi tiết
                </Button>
              </Link>
              <div>
                {info?.contract?.status === "Đã tất toán" && (
                  <Button
                    className=" bg-red-600 text-gray-50"
                    danger
                    onClick={() => showModal(info._id, info.carId._id)}
                  >
                    Đánh giá
                  </Button>
                )}
                <RatingModal
                  open={open}
                  handleCancel={handleCancel}
                  bookingId={bookingId}
                  carId={carId}
                  accessToken={accessToken}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
