import FooterComponent from "@/components/FooterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import useLocalStorage from "@/hooks/useLocalStorage";
import CarLiked from "@/pages/profile/car-liked";
import CarRental from "@/pages/profile/car-rental/index";
import ChangePassword from "@/pages/profile/change-password";
import Driver from "@/pages/profile/driver-licenses/index";
import Account from "@/pages/profile/index";
import { useDriverState } from "@/recoils/driver.state";
import { useUserState } from "@/recoils/user.state.js";
import {
  CarFilled,
  HeartOutlined,
  IdcardOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Tabs } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";

const { TabPane } = Tabs;

const { Content } = Layout;
const onChange = (key) => {
  console.log(key);
};

export const ProfileLayout = ({ children }) => {
  const [tabPosition, setTabPosition] = useState("left");
  const [user, setUser] = useUserState();
  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");
  const [profile, setProfile, clearProfile] = useLocalStorage("profile", "");
  const [driver, setDriver] = useDriverState();
  const router = useRouter();
  const items = [
    {
      key: "1",
      label: (
        <span className="text-base font-semibold">
          {" "}
          <UserOutlined />
          Profile
        </span>
      ),

      children: <Account />,
    },
    {
      key: "2",
      label: (
        <span className="text-base font-semibold">
          {" "}
          <IdcardOutlined />
          Giấy phép lái xe
        </span>
      ),

      children: <Driver />,
    },

    {
      key: "3",
      label: (
        <span className="text-base font-semibold">
          <CarFilled />
          Lịch sử thuê xe{" "}
        </span>
      ),
      children: <CarRental />,
    },
    {
      key: "4",
      label: (
        <span className="text-base font-semibold">
          <HeartOutlined />
          Xe yêu thích
        </span>
      ),
      children: <CarLiked />,
    },
    {
      key: "5",
      label: (
        <span className="text-base font-semibold">
          <KeyOutlined />
          Đổi mật khẩu
        </span>
      ),
      children: <ChangePassword />,
    },
    {
      key: "6",
      label: (
        <div
          onClick={() => {
            clearAccessToken();
            setUser(null);
            setDriver(null);
            clearProfile();
            router.push("/");
          }}
        >
          {" "}
          <span className="text-base font-semibold text-center ">
            <LogoutOutlined className=" text-red-600  " />
            Logout
          </span>
        </div>
      ),
    },
  ];
  return (
    <>
      <HeaderComponent />
      <div>
        <Layout className="flex max-w-6xl h-screen mx-auto bg-white ">
          <Layout className=" flex max-w-6xl relative my-2 bg-white" hasSider>
            <Content className="flex flex-col my-5 bg-white">
              <Tabs
                className="w-full flex mt-10 "
                defaultActiveKey="1"
                tabPosition={tabPosition}
                items={items}
                onChange={onChange}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
      <FooterComponent />
    </>
  );
};
