import { getBrands } from "@/apis/brands.api";
import {
  changeStatusCar,
  createCar,
  getCar,
  getCars,
  updateCar,
  updateCarStatus,
} from "@/apis/cars.api";
import { getMOdels } from "@/apis/model.api";
import { UploadImage } from "@/components/UploadImage";
import { UploadMultipleImage } from "@/components/UploadMultipleImage";
import {
  GET_BRANDS_KEY,
  GET_CARS_KEY,
  GET_CAR_KEY,
  GET_MODEL_KEY,
} from "@/constants/react-query-key.constant";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useUserState } from "@/recoils/user.state";
import { formatCurrency } from "@/utils/number.utils";
import {
  CloseCircleOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tooltip,
  message,
} from "antd";
import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useAccessTokenValue } from "@/recoils/accessToken.state";
import { updateUserStatus } from "@/apis/admin-staff.api";

function UpsertCarForm({ carId, onOk }) {
  console.log({ carId });
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
        console.log(values, carId);

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
  const [accessToken] = useLocalStorage("access_token");
  const { data, refetch } = useQuery({
    queryFn: getCars,
    queryKey: [GET_CARS_KEY],
  });

  const dataSource = data?.result?.cars.map((item, idx) => ({
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
  }));

  const handleInsertCar = () => {
    setUpsertCarModal({ actionType: "insert" });
  };

  const apiUpdateStatus = useMutation({
    mutationFn: updateCarStatus,
    onSuccess: refetch,
  });

  console.log(upsertCarModal);
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Button onClick={handleInsertCar}>
            <PlusOutlined /> Tạo mới xe
          </Button>
        </div>
      </div>

      <div className="shadow-lg rounded-md">
        <Table
          scroll={{ y: 460, x: 2000 }}
          pagination={{ pageSize: 4 }}
          columns={[
            {
              key: "thumb",
              title: "Ảnh xe",
              dataIndex: "thumb",
              render: (url) => (
                <Image
                  className="h-32 aspect-video rounded-md object-cover"
                  src={url}
                />
              ),
            },
            { key: "model", title: "Hãng xe", dataIndex: "model" },
            { key: "numberSeat", title: "Số ghế", dataIndex: "numberSeat" },
            {
              key: "transmissions",
              title: "Truyền động",
              dataIndex: "transmissions",
            },
            {
              key: "yearManufacture",
              title: "Năm sản xuất",
              dataIndex: "yearManufacture",
            },
            {
              key: "numberCar",
              title: "Biển số xe",
              dataIndex: "numberCar",
            },
            {
              key: "description",
              title: "Mô tả",
              dataIndex: "description",
            },
            { key: "cost", title: "Giá", dataIndex: "cost" },
            // { key: "owner", title: "Owner", dataIndex: "owner" },

            {
              key: "status",
              title: "Trạng thái",
              fixed: "right",
              dataIndex: "status",
              width: "8%",
              render: (status) => (
                <>
                  {status === "Hoạt động" ? (
                    <>
                      <p className="text-green-500 justify-center">Hoạt động</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-500 justify-center">
                        Không hoạt động
                      </p>
                    </>
                  )}
                </>
              ),
            },
            {
              key: "action",
              fixed: "right",
              width: "11%",
              render: (_, car) => (
                <div className="flex gap-2">
                  <Tooltip
                    placement="top"
                    title={"Chỉnh sửa xe"}
                    color="#108ee9"
                  >
                    <Button
                      className="bg-blue-500 text-white border-none hover:bg-blue-500/70"
                      onClick={() => {
                        setUpsertCarModal({
                          actionType: "update",
                          carId: car._id,
                        });
                      }}
                    >
                      <EditOutlined />
                    </Button>
                  </Tooltip>

                  <div className="flex gap-2">
                    {car?.status === "Hoạt động" && (
                      <Popconfirm
                        title="Bạn có chắc muốn vô hiệu hóa chiếc xe này?"
                        okText="Vô hiệu hóa"
                        cancelText="Hủy bỏ"
                        onConfirm={() => {
                          apiUpdateStatus.mutateAsync({
                            accessToken,
                            carId: car?._id,
                            status: "Không hoạt động",
                          });
                        }}
                      >
                        <Button className="bg-red-500 text-white border-none hover:bg-red-500/70">
                          Vô hiệu hóa
                        </Button>
                      </Popconfirm>
                    )}

                    {car?.status === "Không hoạt động" && (
                      <Popconfirm
                        title="Bạn muốn Hủy vô hiệu hóa chiếc xe này?"
                        okText="Hủy vô hiệu hóa "
                        cancelText="Hủy bỏ"
                        onConfirm={() => {
                          apiUpdateStatus.mutateAsync({
                            accessToken,
                            carId: car?._id,
                            status: "Hoạt động",
                          });
                        }}
                      >
                        <Button className="bg-green-500 text-white border-none hover:bg-green-500/70">
                          Hủy vô hiệu hóa
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
          dataSource={dataSource}
          rowKey="id"
        />
      </div>

      <Modal
        open={upsertCarModal}
        title={
          upsertCarModal?.actionType === "insert"
            ? "Tạo mới xe"
            : "Chỉnh sửa xe"
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
    </>
  );
}

AdminManageCars.Layout = AdminLayout;
