import React from "react";

import { UserFilledIcon } from "@/icons";
import styled from "@emotion/styled";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/logo2.png";
import { Avatar, Layout, Menu, Space, Button, Dropdown } from "antd";
import { useUserState } from "@/recoils/user.state.js";
import { useDriverState } from "@/recoils/driver.state";
import {
  CarOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/router";

const StyledMenu = styled(Menu)`
  &.ant-menu {
    border-bottom: none;
    display: flex;
    justify-content: center;
  }

  .ant-menu-item {
    padding: 0 20px;
    margin: 0 4px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: #22c55e;
      background-color: rgba(34, 197, 94, 0.05);
    }

    &.ant-menu-item-selected {
      color: #22c55e;
      background-color: rgba(34, 197, 94, 0.1);

      &::after {
        border-bottom: 2px solid #22c55e;
      }
    }
  }
`;

const LogoContainer = styled.div`
  position: relative;
  height: 40px;
  width: 50px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 4px 6px rgba(34, 197, 94, 0.1));
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(34, 197, 94, 0.6),
      transparent
    );
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const { Header } = Layout;

export default function HeaderComponent() {
  const [user, setUser] = useUserState();
  const [driver, setDriver] = useDriverState();
  const router = useRouter();
  const { pathname, push } = useRouter();
  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");
  const [profile, setProfile, clearProfile] = useLocalStorage("profile", "");

  const handleLogout = () => {
    clearAccessToken();
    clearProfile();
    setUser(null);
    setDriver(null);
    router.push("/");
  };

  const items = [
    {
      label: (
        <div
          onClick={() => push("/profile")}
          className="flex items-center py-2 px-1 hover:text-green-500 transition-colors"
        >
          <UserOutlined className="mr-2" />
          Thông tin cá nhân
        </div>
      ),
      key: "0",
    },
    {
      type: "divider",
    },
    {
      label: (
        <div
          onClick={handleLogout}
          className="flex items-center py-2 px-1 hover:text-red-500 transition-colors"
        >
          <LogoutOutlined className="text-red-500 mr-2" />
          Đăng xuất
        </div>
      ),
      key: "1",
    },
  ];

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link href={"/"}>Trang chủ</Link>,
    },
    {
      key: "/about-us",
      icon: <InfoCircleOutlined />,
      label: <Link href={"/about-us"}>Về FRT</Link>,
    },
    {
      key: "/cars",
      icon: <CarOutlined />,
      label: <Link href={"/cars"}>Danh sách xe</Link>,
    },
  ];

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 99,
        width: "100%",
        padding: "0 20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      className="bg-white h-16 flex items-center"
    >
      <div className="flex h-full w-full max-w-6xl mx-auto justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <LogoContainer>
              <Image
                src={logo || "/placeholder.svg"}
                alt="FRT Logo"
                fill
                className="object-contain"
                priority
                style={{
                  filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))",
                  borderRadius: "3px",
                }}
              />
            </LogoContainer>
          </Link>
        </div>

        {/* Navigation */}
        <StyledMenu
          className="border-none flex-1 mx-4 hidden md:flex"
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
        />

        {/* Auth Buttons or User Profile */}
        {!user ? (
          <Space className="shrink-0">
            <Link href="/register">
              <Button
                className="font-medium border-green-500 text-green-500 hover:text-green-600 hover:border-green-600 h-9 px-4 rounded-lg"
                type="default"
              >
                Đăng ký
              </Button>
            </Link>
            <Link href="/login">
              <Button
                className="font-medium bg-green-500 hover:bg-green-600 border-none h-9 px-4 rounded-lg shadow-sm hover:shadow transition-all"
                type="primary"
              >
                Đăng nhập
              </Button>
            </Link>
          </Space>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="rounded-lg shadow-lg"
              overlayStyle={{ minWidth: "180px" }}
              dropdownRender={(menu) => (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-600">
                      Xin chào
                    </p>
                    <p className="text-base font-semibold text-gray-900 truncate max-w-[200px]">
                      {user?.result?.fullname || "Người dùng"}
                    </p>
                  </div>
                  {React.cloneElement(menu)}
                </div>
              )}
            >
              <div className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-full hover:bg-gray-50 transition-colors">
                {user?.result?.profilePicture ? (
                  <Avatar
                    src={user?.result?.profilePicture}
                    size={36}
                    className="border-2 border-green-100"
                  />
                ) : (
                  <div className="bg-green-50 p-2 rounded-full flex items-center justify-center">
                    <UserFilledIcon className="text-green-500 text-lg" />
                  </div>
                )}
                <span className="font-medium text-gray-700 hidden sm:inline-block">
                  {user?.result?.fullname?.split(" ").pop() || "Người dùng"}
                </span>
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    </Header>
  );
}
