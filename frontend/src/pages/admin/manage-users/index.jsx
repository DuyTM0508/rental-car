import { getUsers, updateUserStatus } from "@/apis/admin-staff.api";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Popconfirm, Table } from "antd";

export default function AdminManageUsers() {
  const [accessToken] = useLocalStorage("access_token");

  const { data: users, refetch } = useQuery({
    queryFn: () => getUsers({ accessToken }),
  });

  const apiUpdateStatus = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: refetch,
  });

  return (
    <>
      <div className="shadow-lg rounded-md">
        <Table
          scroll={{ y: 480 }}
          columns={[
            {
              key: "profilePicture",
              title: "Ảnh đại diện",
              dataIndex: "profilePicture",
              responsive: ["sm"],
              render: (url) => <Avatar src={url} />,
            },
            {
              key: "name",
              title: "Họ tên",
              dataIndex: "fullname",
              responsive: ["lg"],
            },
            { key: "email", title: "Email", dataIndex: "email" },
            {
              key: "phoneNumber",
              title: "Số điện thoại",
              dataIndex: "phoneNumber",
            },
            { key: "address", title: "Địa chỉ", dataIndex: "address" },
            {
              key: "action",
              render: (_, user) => (
                <div className="flex gap-2">
                  {user?.status === "Hoạt động" && (
                    <Popconfirm
                      title="Bạn có chắc muốn chặn người dùng này?"
                      okText="Chặn"
                      cancelText="Hủy"
                      onConfirm={() => {
                        apiUpdateStatus.mutateAsync({
                          accessToken,
                          userId: user._id,
                          status: "Không hoạt động",
                        });
                      }}
                    >
                      <Button className="bg-red-500 text-white border-none hover:bg-red-500/70">
                        Chặn
                      </Button>
                    </Popconfirm>
                  )}

                  {user?.status === "Không hoạt động" && (
                    <Popconfirm
                      title="Bạn muốn bỏ chặn người dùng này?"
                      okText="Bỏ chặn"
                      cancelText="Hủy"
                      onConfirm={() => {
                        apiUpdateStatus.mutateAsync({
                          accessToken,
                          userId: user._id,
                          status: "Hoạt động",
                        });
                      }}
                    >
                      <Button className="bg-green-500 text-white border-none hover:bg-green-500/70">
                        Bỏ chặn
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              ),
            },
          ]}
          dataSource={users}
          rowKey="id"
        />
      </div>
    </>
  );
}

AdminManageUsers.Layout = AdminLayout;