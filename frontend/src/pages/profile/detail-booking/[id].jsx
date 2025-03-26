import { getDetailBooking } from "@/apis/user-bookings.api";
import { GET_DETAIL_BOOKING_KEY } from "@/constants/react-query-key.constant";
import useLocalStorage from "@/hooks/useLocalStorage";
import { SeatIcon, TransmissionIcon } from "@/icons";
import { formatCurrency } from "@/utils/number.utils";
import {
  ContainerOutlined,
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { Divider, Image, Space, Table } from "antd";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function BookingDetailPage() {
  const BorderlessTable = styled(Table)`
    .ant-table {
      background-color: transparent;
    }
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      border-bottom: 1px solid gray;
    }
  `;
  const router = useRouter();
  const bookingId = router.query.id;
  console.log(bookingId);
  const [accessToken] = useLocalStorage("access_token");

  const { data } = useQuery({
    queryKey: [GET_DETAIL_BOOKING_KEY, bookingId],
    queryFn: () => getDetailBooking(accessToken, bookingId.toString()),
  });

  const onDownload = () => {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "image.png";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };

  const src = data?.result?.carId?.thumb;
  const [isPreviewVisible, setPreviewVisible] = useState(false);

  return (
    <div className="flex flex-col border-b my-6 py-2 max-w-6xl mx-auto">
      <p className="flex justify-center items-center text-2xl font-bold mt-0">
        Thông tin chi tiết
      </p>
      <div className=" flex flex-row w-full gap-4">
        <div className="flex flex-col  bg-neutral-50 p-4 ml-5 mr-5 w-1/2 shadow-xl rounded-lg">
          <div className="flex p-4">
            <Image
              width={200}
              src={src}
              preview={{
                toolbarRender: (
                  _,
                  {
                    transform: { scale },
                    actions: {
                      onFlipY,
                      onFlipX,
                      onRotateLeft,
                      onRotateRight,
                      onZoomOut,
                      onZoomIn,
                    },
                  }
                ) => (
                  <Space size={12} className="toolbar-wrapper">
                    <SwapOutlined rotate={90} onClick={onFlipY} />
                    <SwapOutlined onClick={onFlipX} />
                    <RotateLeftOutlined onClick={onRotateLeft} />
                    <RotateRightOutlined onClick={onRotateRight} />
                    <ZoomOutOutlined
                      disabled={scale === 1}
                      onClick={onZoomOut}
                    />
                    <ZoomInOutlined
                      disabled={scale === 50}
                      onClick={onZoomIn}
                    />
                  </Space>
                ),
              }}
            />
            <div className="flex flex-col ml-5 justify-between">
              <h2 className="text-green-500 font-semibold">
                {data?.result?.carId?.model?.name}{" "}
                {data?.result?.carId?.yearManufacture}
              </h2>
              <span className="flex items-center text-base font-semibold">
                <SeatIcon className="mr-2 text-green-500" />
                {data?.result?.carId?.numberSeat}
              </span>
              <span className="flex items-center text-base font-semibold">
                <SeatIcon className="mr-2  text-green-500" />
                {data?.result?.carId?.numberCar}
              </span>
              <span className="flex items-center text-base font-semibold">
                <TransmissionIcon className="mr-2 text-green-500" />
                {data?.result?.carId?.transmissions}
              </span>
            </div>
          </div>
          <Divider className="m-0 w-full border-1 border-gray-400" />
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4 ml-5"></div>

            <div className="flex flex-col items-center w-full ">
              <div className="p-4 w-full">
                <h3 className="mt-0">Địa điểm giao xe</h3>
                <span className="font-medium text-gray-800">
                  {data?.result?.address}
                </span>
              </div>
              <Divider className="m-0 w-full border-1 border-gray-400" />

              <div className="w-full p-4">
                <h3 className="mt-0">Thông tin người nhận</h3>
                <span className="font-medium text-gray-800 text-sm">
                  Tên: {data?.result?.bookBy?.fullname}
                </span>
                <p className="font-medium text-gray-800">
                  Số điện thoại: {data?.result?.phone}
                </p>
                <p className="font-medium text-gray-800">
                  Địa chỉ: {data?.result?.bookBy?.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-9 bg-neutral-50 shadow-xl rounded-lg w-1/2">
          <BorderlessTable
            columns={[
              { dataIndex: "label" },
              { dataIndex: "price", className: "text-right" },
            ]}
            bordered={false}
            showHeader={false}
            pagination={false}
            rowKey={(row) => row.label}
            dataSource={[
              {
                label: "Ngày nhận xe",
                price: moment(data?.result?.timeBookingStart).format(
                  "DD-MM-YYYY"
                ),
              },
              {
                label: "Ngày trả xe",
                price: moment(data?.result?.timeBookingEnd).format(
                  "DD-MM-YYYY"
                ),
              },
              {
                label: "Đơn giá thuê",
                price: formatCurrency(data?.result?.carId?.cost) + "/ngày",
              },
              {
                label: "Phương thức thanh toán",
                price: "ZaloPay",
              },
            ]}
          />
          <div className="pl-4 flex items-center justify-between m-0">
            <h3 className="text-green-500 text-lg m-0">Tổng giá thuê:</h3>
            <h3 className="text-green-500 text-lg m-0">
              {formatCurrency(data?.result?.totalCost)}
            </h3>
          </div>
          {data?.result?.contract && (
            <Image.PreviewGroup
              preview={{
                visible: isPreviewVisible,
                onChange: (current, prev) =>
                  console.log(`current index: ${current}, prev index: ${prev}`),
                onVisibleChange: (visible, prevVisible) =>
                  setPreviewVisible(visible),
                toolbarRender: (
                  _,
                  {
                    transform: { scale },
                    actions: {
                      onFlipY,
                      onFlipX,
                      onRotateLeft,
                      onRotateRight,
                      onZoomOut,
                      onZoomIn,
                    },
                  }
                ) => (
                  <Space size={12} className="toolbar-wrapper">
                    <SwapOutlined rotate={90} onClick={onFlipY} />
                    <SwapOutlined onClick={onFlipX} />
                    <DownloadOutlined onClick={onDownload} />
                    <RotateLeftOutlined onClick={onRotateLeft} />
                    <RotateRightOutlined onClick={onRotateRight} />
                    <ZoomOutOutlined
                      disabled={scale === 1}
                      onClick={onZoomOut}
                    />
                    <ZoomInOutlined
                      disabled={scale === 50}
                      onClick={onZoomIn}
                    />
                  </Space>
                ),
              }}
            >
              <div className="pl-4 flex justify-end">
                <a
                  className="text-base"
                  onClick={() => setPreviewVisible(!isPreviewVisible)}
                >
                  <ContainerOutlined />
                  Xem hợp đồng
                </a>
              </div>
              <div className="hidden">
                {data?.result?.contract?.images.map((src, idx) => (
                  <Image key={idx} src={src} />
                ))}
              </div>
            </Image.PreviewGroup>
          )}
        </div>
      </div>
    </div>
  );
}
