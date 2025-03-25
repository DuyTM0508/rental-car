import useLocalStorage from "@/hooks/useLocalStorage";
import { ContractIcon, FinalContractIcon } from "@/icons";
import { useUserState } from "@/recoils/user.state.js";
import {
  BellOutlined,
  BookOutlined,
  CarOutlined,
  IdcardOutlined,
  LogoutOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Layout, Menu } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "../../public/logo2.png";

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
        <div className="w-full h-32 flex justify-center items-center mb-10 relative">
          <Link href={`/admin/dashboard`}>
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-50 via-white to-green-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              <div className="relative">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt="FRT Admin Logo"
                  width={170}
                  height={100}
                  unoptimized={true}
                  className="transition-all duration-300 group-hover:scale-105 rounded-xl"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(34, 197, 94, 0.15))",
                  }}
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-sm bg-white px-3 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                  Admin Dashboard
                </div>
              </div>
              <div className="h-0.5 w-0 bg-gradient-to-r from-green-300 to-green-500 absolute -bottom-2 left-0 group-hover:w-full transition-all duration-500 ease-out"></div>
            </div>
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
