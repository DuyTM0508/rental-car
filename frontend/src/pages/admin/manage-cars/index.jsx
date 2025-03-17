import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getCars,
  updateCarStatus,
  createCar,
  updateCar,
  getCar,
} from "@/apis/cars.api";
import { getBrands } from "@/apis/brands.api";
import { getMOdels } from "@/apis/model.api";
import {
  GET_CARS_KEY,
  GET_BRANDS_KEY,
  GET_MODEL_KEY,
  GET_CAR_KEY,
} from "@/constants/react-query-key.constant";
import { AdminLayout } from "@/layouts/AdminLayout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state";
import { formatCurrency } from "@/utils/number.utils";
import {
  Button,
  Table,
  Image,
  Popconfirm,
  Modal,
  Input,
  Typography,
  Space,
  Tag,
  Tooltip,
  Form,
  Select,
  InputNumber,
  Skeleton,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { UploadImage } from "@/components/UploadImage";
import { UploadMultipleImage } from "@/components/UploadMultipleImage";

const { Title, Text } = Typography;

function UpsertCarForm({ carId, onOk }) {
  const [user] = useUserState();
  const [accessToken] = useLocalStorage("access_token");
  const isInsert = !carId;
  const [form] = Form.useForm();
  const brandId = Form.useWatch(["brand"], form);

  const carDetail = useQuery({
    queryFn: () => getCar(carId, accessToken),
    queryKey: [GET_CAR_KEY, carId],
  });

  const apiCreateCar = useMutation({
    mutationFn: createCar,
  });

  const apiUpdateCar = useMutation({
    mutationFn: updateCar,
  });

  const { data: getModelsRes } = useQuery({
    queryFn: () => getMOdels(brandId),
    queryKey: [GET_MODEL_KEY, brandId],
    enabled: !!brandId,
  });

  const { data: getBrandsRes } = useQuery({
    queryFn: getBrands,
    queryKey: [GET_BRANDS_KEY],
  });

  const brandOptions = getBrandsRes?.result?.map((item) => ({
    value: item._id,
    label: item.name,
  }));

  const modelOptions = getModelsRes?.result.map((item) => ({
    value: item._id,
    label: item.name,
  }));
  const statusCar = [
    { value: "Hoạt động", label: "Hoạt động" },
    { value: "Không hoạt động", label: "Không hoạt động" },
  ];

  if (carDetail.isLoading) {
    return <Skeleton active />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      className="flex flex-col gap-4 mt-10"
      initialValues={{
        ...carDetail.data?.result,
        brand: carDetail.data?.result?.brand._id,
        model: carDetail.data?.result?.model._id,
      }}
      onFinish={async (values) => {
        if (isInsert) {
          await apiCreateCar.mutateAsync({
            body: { ...values, user: user.id },
            accessToken,
          });
          message.success("Tạo xe thành công");
        } else {
          console.log({ values });
          await apiUpdateCar.mutateAsync({
            carId,
            body: { ...values, user: user.id },
            accessToken,
          });
          message.success("Cập nhập xe thành công");
        }

        onOk?.();
      }}
    >
      <div className="h-[60vh] overflow-y-scroll flex gap-2">
        <div className="grow w-2/5 p-2">
          <Form.Item
            label="Ảnh tiêu đề"
            name="thumb"
            className="w-4/5 h-4/5"
            rules={[
              {
                required: true,
                message: "Hình Ảnh Không được để trống!",
              },
            ]}
          >
            <UploadImage />
          </Form.Item>

          <Form.Item
            label="Ảnh"
            name="images"
            rules={[
              {
                required: true,
                message: "Hình ảnh không được để trống!",
              },
            ]}
          >
            <UploadMultipleImage />
          </Form.Item>
        </div>
        <div className="w-3/5 p-2">
          <Form.Item
            label="Hãng xe"
            required
            name="brand"
            rules={[
              {
                required: true,
                message: "Hãy chọn hãng xe!",
              },
            ]}
          >
            <Select options={brandOptions} />
          </Form.Item>
          <Form.Item
            label="Loại xe"
            required
            name="model"
            rules={[
              {
                required: true,
                message: "Hãy chọn loại xe!",
              },
            ]}
          >
            <Select options={modelOptions} disabled={!brandId} />
          </Form.Item>
          <Form.Item
            label="Số ghế"
            required
            name="numberSeat"
            rules={[
              {
                required: true,
                message: "Hãy chọn số ghế của xe!",
              },
            ]}
          >
            <Select
              options={[
                { value: "2 chỗ" },
                { value: "4 chỗ" },
                { value: "5 chỗ" },
                { value: "7 chỗ" },
                { value: "9 chỗ" },
                { value: "12 chỗ" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Truyền động"
            required
            name="transmissions"
            rules={[
              {
                required: true,
                message: "Hãy chọn truyền động!",
              },
            ]}
          >
            <Select options={[{ value: "Số sàn" }, { value: "Số tự động" }]} />
          </Form.Item>
          <Form.Item
            label="Biển số xe"
            name="numberCar"
            rules={[
              {
                required: true,
                message: "Hãy nhập biển số xe!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Năm sản xuất"
            name="yearManufacture"
            rules={[
              {
                required: true,
                message: "Hãy nhập năm sản xuất !",
              },
            ]}
          >
            <InputNumber className="w-full" min={1800} max={2024} />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            required
            name="description"
            rules={[
              {
                required: true,
                message: "Hãy mô tả chiếc xe!",
              },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Giá tiền thuê xe trong 1 ngày"
            required
            name="cost"
            rules={[
              {
                required: true,
                message: "Hãy đăng ảnh tất toán hợp đồng lên!",
              },
            ]}
          >
            <InputNumber className="w-full" />
          </Form.Item>
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <Button type="primary" htmlType="submit">
          {isInsert ? "Add" : "Update"}
        </Button>
      </div>
    </Form>
  );
}

export default function AdminManageCars() {
  const [upsertCarModal, setUpsertCarModal] = useState();
  const [searchText, setSearchText] = useState("");
  const [accessToken] = useLocalStorage("access_token");

  const { data, refetch, isLoading } = useQuery({
    queryFn: getCars,
    queryKey: [GET_CARS_KEY],
  });

  const apiUpdateStatus = useMutation({
    mutationFn: updateCarStatus,
    onSuccess: refetch,
  });

  const dataSource = data?.result?.cars
    .map((item, idx) => ({
      id: idx + 1,
      _id: item?._id,
      thumb: item?.thumb,
      brand: item?.brand?.name,
      model: item?.model?.name,
      numberSeat: item?.numberSeat,
      transmissions: item?.transmissions,
      yearManufacture: item?.yearManufacture,
      numberCar: item?.numberCar,
      description: item?.description,
      cost: formatCurrency(item.cost),
      owner: item?.user?.fullname,
      status: item?.status,
    }))
    .filter(
      (car) =>
        car.brand.toLowerCase().includes(searchText.toLowerCase()) ||
        car.model.toLowerCase().includes(searchText.toLowerCase()) ||
        car.numberCar.toLowerCase().includes(searchText.toLowerCase())
    );

  const columns = [
    {
      key: "thumb",
      title: "Ảnh xe",
      dataIndex: "thumb",
      render: (url) => (
        <Image
          className="h-24 w-40 object-cover rounded-lg shadow-md"
          src={url || "/placeholder.svg"}
          alt="Car"
        />
      ),
    },
    {
      key: "brand",
      title: "Hãng xe",
      dataIndex: "brand",
      render: (text) => <Text strong>{text}</Text>,
    },
    { key: "model", title: "Mẫu xe", dataIndex: "model" },
    {
      key: "numberSeat",
      title: "Số ghế",
      dataIndex: "numberSeat",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    { key: "transmissions", title: "Truyền động", dataIndex: "transmissions" },
    { key: "yearManufacture", title: "Năm SX", dataIndex: "yearManufacture" },
    { key: "numberCar", title: "Biển số", dataIndex: "numberCar" },
    {
      key: "cost",
      title: "Giá thuê/ngày",
      dataIndex: "cost",
      render: (text) => <Text type="success">{text}</Text>,
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Hoạt động" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      key: "action",
      title: "Thao tác",
      fixed: "right",
      width: "15%",
      render: (_, car) => (
        <Space>
          <Tooltip title="Chỉnh sửa xe">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setUpsertCarModal({ actionType: "update", carId: car._id });
              }}
            >
              Sửa
            </Button>
          </Tooltip>
          <Popconfirm
            title={`Bạn muốn ${
              car.status === "Hoạt động" ? "vô hiệu hóa" : "kích hoạt"
            } xe này?`}
            onConfirm={() => {
              apiUpdateStatus.mutateAsync({
                accessToken,
                carId: car._id,
                status:
                  car.status === "Hoạt động" ? "Không hoạt động" : "Hoạt động",
              });
            }}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              danger={car.status === "Hoạt động"}
              type={car.status === "Hoạt động" ? "primary" : "default"}
            >
              {car.status === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} className="m-0">
          <CarOutlined className="mr-2" />
          Quản lý xe
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm xe..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setUpsertCarModal({ actionType: "insert" })}
          >
            Thêm xe mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} xe`,
        }}
        className="shadow-sm"
      />

      <Modal
        open={upsertCarModal}
        title={
          <Title level={3}>
            {upsertCarModal?.actionType === "insert"
              ? "Thêm xe mới"
              : "Chỉnh sửa thông tin xe"}
          </Title>
        }
        width={1000}
        style={{ top: 20 }}
        destroyOnClose
        footer={null}
        onCancel={() => setUpsertCarModal(undefined)}
      >
        <UpsertCarForm
          carId={upsertCarModal?.carId}
          onOk={() => {
            setUpsertCarModal(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
}

AdminManageCars.Layout = AdminLayout;
