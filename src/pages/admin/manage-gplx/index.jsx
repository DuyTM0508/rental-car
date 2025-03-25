import {
  acceptLicensesDriver,
  deleteDriverLicense,
  getGPLX,
} from "@/apis/gplx.api";
import { GET_GPLX_KEY } from "@/constants/react-query-key.constant";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  IdcardOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Image,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useState } from "react";

const { Title } = Typography;

export default function AdminManageGPLX() {
  const [searchText, setSearchText] = useState("");
  const [accessToken] = useLocalStorage("access_token");
  const {
    data: gplx,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [GET_GPLX_KEY],
    queryFn: () => getGPLX(accessToken),
  });

  const deleteGPLX = useMutation(
    (driverId) => deleteDriverLicense(driverId, accessToken),
    {
      onSuccess: () => {
        message.success("Xóa bằng lái xe thành công");
        refetch();
      },
      onError: (error) => {
        message.error(`Xóa bằng lái xe thất bại: ${error.message}`);
      },
    }
  );

  const acceptGPLX = useMutation(
    (driverId) => acceptLicensesDriver(accessToken, driverId),
    {
      onSuccess: () => {
        message.success("Duyệt bằng lái xe thành công");
        refetch();
      },
      onError: (error) => {
        message.error(`Duyệt bằng lái xe thất bại: ${error.message}`);
      },
    }
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Ảnh bằng lái xe",
      dataIndex: "img",
      key: "img",
      render: (url) => (
        <Image
          className="rounded-md object-cover"
          src={url || "/placeholder.svg"}
          width={120}
          height={80}
          alt="Bằng lái xe"
        />
      ),
    },
    {
      title: "Số Bằng lái xe",
      dataIndex: "drivingLicenseNo",
      key: "drivingLicenseNo",
      filterSearch: true,
      onFilter: (value, record) => record.drivingLicenseNo.startsWith(value),
    },
    {
      title: "Hạng",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chưa xác thực", value: "Chưa xác thực" },
        { text: "Đã xác thực", value: "Đã xác thực" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag
          color={status === "Đã xác thực" ? "success" : "error"}
          icon={
            status === "Đã xác thực" ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Duyệt bằng lái xe">
            <Popconfirm
              title="Bạn có chắc chắn muốn duyệt bằng lái xe này?"
              onConfirm={() => acceptGPLX.mutate(record.driverId)}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                disabled={record.status === "Đã xác thực"}
              >
                Duyệt
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xóa bằng lái xe">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa bằng lái xe này?"
              onConfirm={() => deleteGPLX.mutate(record.driverId)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const dataSource = gplx?.result
    .map((item, idx) => ({
      key: item?._id,
      driverId: item?._id,
      id: idx + 1,
      img: item?.image,
      drivingLicenseNo: item?.drivingLicenseNo,
      class: item?.class,
      status: item?.status,
    }))
    .filter(
      (item) =>
        item.class.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} className="mb-6">
          <IdcardOutlined className="mr-2" />
          Quản lý bằng lái xe
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm bằng lái xe..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} bằng lái xe`,
        }}
        scroll={{ x: 768, y: 500 }}
      />
    </div>
  );
}

AdminManageGPLX.Layout = AdminLayout;
