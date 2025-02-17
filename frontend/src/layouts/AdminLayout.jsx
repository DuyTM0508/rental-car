import { Avatar, Layout, Menu, Dropdown, Space } from "antd";
import {
  BellOutlined,
  UsergroupAddOutlined,
  CarOutlined,
  BookOutlined,
  ContactsOutlined,
  IdcardOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { ContractIcon, FinalContractIcon } from "@/icons";
import { GPLXIcon } from "@/icons";
import { useRouter } from "next/router";
import Image from "next/image";
import { useUserState } from "@/recoils/user.state.js";
import useLocalStorage from "@/hooks/useLocalStorage";
import logo from "../../public/logo.png";
import Link from "next/link";

const { Sider, Header, Content } = Layout;

export const AdminLayout = ({ children }) => {
  const { pathname, push } = useRouter();
  const [user, setUser] = useUserState();
  const router = useRouter();
  const role = user?.result.role;
  const selectedKeys = [pathname.replace("/admin/", "")];
  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");
  const items = [
    {
      label: (
        <div onClick={() => push("/admin/profile-admin")}>
          <UserOutlined className="mr-2" />
          Thông tin cá nhân
        </div>
      ),
      key: "0",
    },
    {
      label: (
        <div
          onClick={() => {
            clearAccessToken();
            setUser(null);
            router.push("/");
          }}
        >
          {" "}
          <LogoutOutlined className=" text-red-600 mr-2" />
          Đăng xuất
        </div>
      ),
      key: "1",
    },
  ];
  return (
    <Layout hasSider className="h-screen">
      <Sider theme="light" className="border-r shadow bg-white p-6" width={310}>
        <div className="w-full  h-32 flex justify-center items-center mb-10">
          <Link href={`/admin/dashboard`}>
            <Image
              src={logo}
              alt="logo"
              width={170}
              height={100}
              // loader={loaderProp}
              unoptimized={true}
              className="cursor-pointer"
            />
          </Link>
        </div>
        <Menu
          selectedKeys={selectedKeys}
          items={[
            {
              key: "manage-users",
              label: "Quản lí người dùng",
              icon: <UsergroupAddOutlined />,
            },
            role === "admin"
              ? {
                  key: "manage-staffs",
                  label: "Quản lí nhân viên",
                  icon: <UsergroupAddOutlined />,
                }
              : undefined,
            {
              key: "manage-cars",
              label: "Quản lí xe",
              icon: <CarOutlined />,
            },
            {
              key: "manage-bookings",
              label: "Quản lí thuê xe",
              icon: <BookOutlined />,
            },
            {
              key: "manage-contracts",
              label: "Quản lí hợp đồng",
              icon: (
                <ContractIcon className="shrink-0 text-2xl text-green-500 w-0.5" />
              ),
            },
            {
              key: "manage-final-contracts",
              label: "Tất toán hợp đồng",
              icon: (
                <FinalContractIcon className="shrink-0 text-2xl text-green-500 w-0.5" />
              ),
            },
            {
              key: "manage-coupon",
              label: "Quản lí mã giảm giá",
              icon: <IdcardOutlined />,
            },
            {
              key: "manage-gplx",
              label: "Quản lí bằng lái xe",
              icon: <IdcardOutlined />,
            },
            {
              key: "profile-admin",
              label: "Trang cá nhân",
              icon: <UserOutlined />,
            },
          ]}
          onClick={(item) => push(`/admin/${item.key}`)}
        />
      </Sider>
      <Layout>
        <Header className="bg-white sticky top-0 z-10 flex justify-between items-center shadow">
          <div className="text-2xl font-bold">Dashboard</div>
          <div className="flex gap-4 items-center">
            <BellOutlined className="text-xl" />
            <Dropdown
              className="cursor-pointer"
              menu={{
                items,
              }}
              placement="bottom"
              trigger={["click"]}
            >
              <Avatar src={user?.result?.profilePicture} />
            </Dropdown>
            <span className="flex ">{user?.result?.fullname}</span>
          </div>
        </Header>
        <Content className="p-4 bg-slate-50">{children}</Content>
      </Layout>
    </Layout>
  );
};
