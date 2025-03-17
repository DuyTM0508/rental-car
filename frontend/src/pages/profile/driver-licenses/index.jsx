import useLocalStorage from "@/hooks/useLocalStorage";
import { useDriverState } from "@/recoils/driver.state";
import { useUserState } from "@/recoils/user.state.js";
import {
  EditOutlined,
  QuestionCircleOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Button, Image, Input, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";

import { apiClient } from "@/apis/client";
import RegisterDriverModal from "@/components/RegisterDriverModal";
import styled from "@emotion/styled";
const { Title } = Typography;
const StyleInput = styled(Input)`
  display: flex;
  align-items: center;
  padding: 12px;
  width: 100%;
`;

export default function DriverPage() {
  const [openRegisterDriver, setOpenRegisterDriver] = useState(false);
  const showModalRegister = () => setOpenRegisterDriver(true);
  const handleCancleRegisterDriver = () => setOpenRegisterDriver(false);

  const [user, setUser] = useUserState();
  const [driver, setDriver] = useDriverState();
  const [profile, setProfile, clearProfile] = useLocalStorage("profile", "");

  const [loading, setLoading] = useState(false);
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
          setUser(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProfile(); // Call the fetchData function
  }, [setUser]);

  const status = user?.result?.driverLicenses?.status || "Chưa xác thực";

  const backgroundColor = status === "Chưa xác thực" ? "#ffd0cd" : "#cff1db";

  return (
    <div className="flex flex-col mb-7 gap-5 ">
      <div className="flex flex-col  pl-10 pr-5  pb-6 relative border rounded-xl border-solid border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <Title className="flex items-center font-semibold text-xl" level={3}>
            Giấy phép lái xe
            <p
              className={`rounded-lg text-xs ml-1 ${
                status === "Chưa xác thực" ? "text-red-500" : "text-green-500"
              }`}
              style={{
                background: backgroundColor,
                borderRadius: "100px",
                padding: "4px 6px",
              }}
            >
              {status}
            </p>
          </Title>
          <div className="flex">
            <Button
              type="default"
              // className="rounded-lg border-solid border-black font-bold text-xs"
              onClick={showModalRegister}
            >
              Đăng ký
              <EditOutlined />
            </Button>
            <RegisterDriverModal
              openRegisterDriver={openRegisterDriver}
              handleCancleRegisterDriver={handleCancleRegisterDriver}
            />
          </div>
        </div>
        <div className="flex items-center  ">
          <Title className="text-xs font-medium ">
            Vì sao tôi phải xác thực GPLX
            <QuestionCircleOutlined />
          </Title>
        </div>
        <div className="content flex flex-row">
          <div className="w-full flex flex-col">
            <Title level={5} className="font-semibold">
              Thông tin chung
            </Title>
            <div className="w-4/5 flex flex-col">
              <div className="flex flex-col  justify-between">
                <Title
                  level={5}
                  className="flex items-center text-xs font-medium"
                >
                  Số GPLX
                </Title>
                <StyleInput
                  disabled
                  type="text"
                  className="flex items-center text-base font-semibold text-slate-950"
                  size="small"
                  value={
                    driver?.result?.drivingLicenseNo ||
                    user?.result?.driverLicenses?.drivingLicenseNo
                  }
                />
              </div>

              <div className="flex flex-col justify-between">
                <Title
                  level={5}
                  className="flex items-center text-xs font-medium"
                >
                  Hạng
                </Title>
                <StyleInput
                  disabled
                  type="text"
                  className="flex items-center text-base font-semibold text-slate-950"
                  size="small"
                  value={
                    driver?.result?.class || user?.result?.driverLicenses?.class
                  }
                />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col">
            <Title level={5} className="font-semibold">
              Hình ảnh
            </Title>

            <div className="flex flex-col justify-evenly h-full ">
              <Image
                className="w-full object-cover "
                src={
                  driver?.result?.image ||
                  user?.result?.driverLicenses?.image ||
                  "https://res.cloudinary.com/djllhxlfc/image/upload/v1700240517/cars/default-thumbnail_ycj6n3.jpg"
                }
                alt="Image"
                width={300}
                height={200}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
