
import { getUsers, updateUserStatus } from "@/apis/admin-staff.api";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  SearchOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Input, Modal, Table, Tag } from "antd";
import { useState } from "react";

export default function AdminManageUsers() {
  const [accessToken] = useLocalStorage("access_token");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: users,
    refetch,
    isLoading,
  } = useQuery({
    queryFn: () => getUsers({ accessToken }),
    queryKey: ["users"],
  });

  const apiUpdateStatus = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: refetch,
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm)
  );

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "profilePicture",
      key: "profilePicture",
      render: (url, user) => (
        <Avatar src={url}>
          {!url && (user.fullname?.charAt(0) || user.email?.charAt(0))}
        </Avatar>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      responsive: ["md"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      responsive: ["sm"],
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      responsive: ["lg"],
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Hoạt động" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, user) => (
        <Button
          type={user.status === "Hoạt động" ? "primary" : "default"}
          danger={user.status === "Hoạt động"}
          icon={
            user.status === "Hoạt động" ? (
              <UserDeleteOutlined />
            ) : (
              <UserSwitchOutlined />
            )
          }
          onClick={() => showConfirm(user)}
        >
          {user.status === "Hoạt động" ? "Chặn" : "Bỏ chặn"}
        </Button>
      ),
    },
  ];

  const showConfirm = (user) => {
    Modal.confirm({
      title:
        user.status === "Hoạt động" ? "Chặn người dùng" : "Bỏ chặn người dùng",
      content:
        user.status === "Hoạt động"
          ? "Bạn có chắc muốn chặn người dùng này? Họ sẽ không thể đăng nhập hoặc sử dụng dịch vụ."
          : "Bạn có chắc muốn bỏ chặn người dùng này? Họ sẽ có thể đăng nhập và sử dụng dịch vụ bình thường.",
      onOk() {
        apiUpdateStatus.mutate({
          accessToken,
          userId: user._id,
          status: user.status === "Hoạt động" ? "Không hoạt động" : "Hoạt động",
        });
      },
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-600">
            Xem và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Input
          placeholder="Tìm kiếm người dùng..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 250 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={isLoading}
        scroll={{ x: true }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} người dùng`,
        }}
      />
    </div>
  );
}

AdminManageUsers.Layout = AdminLayout;
