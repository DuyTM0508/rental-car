import { GET_GPLX_KEY } from "@/constants/react-query-key.constant";
import {
  acceptLicensesDriver,
  getGPLX,
  deleteDriverLicense,
} from "@/apis/gplx.api";
import { AdminLayout } from "@/layouts/AdminLayout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  Image,
  Button,
  Popconfirm,
  message,
  Card,
  Typography,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function AdminManageGPLX() {
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

  const dataSource = gplx?.result.map((item, idx) => ({
    key: item?._id,
    driverId: item?._id,
    id: idx + 1,
    img: item?.image,
    drivingLicenseNo: item?.drivingLicenseNo,
    class: item?.class,
    status: item?.status,
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Title level={2} className="mb-6">
          <IdcardOutlined className="mr-2" />
          Quản lý bằng lái xe
        </Title>
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
        scroll={{ x: 1000, y: 500 }}
      />
    </div>
  );
}

AdminManageGPLX.Layout = AdminLayout;
