import { getBrands } from "@/apis/brands.api";
import { createCar, getCar, updateCar } from "@/apis/cars.api";
import { getMOdels } from "@/apis/model.api";
import {
    GET_BRANDS_KEY,
    GET_CAR_KEY,
    GET_MODEL_KEY,
} from "@/constants/react-query-key.constant";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button, Form, Input,
    InputNumber, Select, Skeleton
} from "antd";
import { UploadImage } from "./UploadImage";
import { UploadMultipleImage } from "./UploadMultipleImage";

const UpsertCarForm = ({ carId, onOk }) => {
  const [user] = useUserState();
  const [accessToken] = useLocalStorage("access_token");
  const isInsert = !carId;
  const [form] = Form.useForm();
  const brandId = Form.useWatch(["brand"], form);

  const carDetail = useQuery({
    queryFn: () => getCar(carId, accessToken),
    queryKey: [GET_CAR_KEY, carId],
    enabled: !!carId,
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

  const modelOptions = getModelsRes?.result?.map((item) => ({
    value: item._id,
    label: item.name,
  }));

//   if (carDetail.isLoading) {
//     return <Skeleton active />;
//   }

  return (
    <Form
      form={form}
      layout="vertical"
      className="grid grid-cols-2 gap-4"
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
        } else {
          await apiUpdateCar.mutateAsync({
            carId,
            body: { ...values, user: user.id },
            accessToken,
          });
        }
        onOk?.();
      }}
    >
      <div className="col-span-2 md:col-span-1">
        <Form.Item
          label="Ảnh tiêu đề"
          name="thumb"
          rules={[{ required: true, message: "Hình Ảnh Không được để trống!" }]}
        >
          <UploadImage />
        </Form.Item>

        <Form.Item
          label="Ảnh chi tiết"
          name="images"
          rules={[{ required: true, message: "Hình ảnh không được để trống!" }]}
        >
          <UploadMultipleImage />
        </Form.Item>
      </div>

      <div className="col-span-2 md:col-span-1 space-y-4">
        <Form.Item
          label="Hãng xe"
          name="brand"
          rules={[{ required: true, message: "Hãy chọn hãng xe!" }]}
        >
          <Select options={brandOptions} />
        </Form.Item>

        <Form.Item
          label="Loại xe"
          name="model"
          rules={[{ required: true, message: "Hãy chọn loại xe!" }]}
        >
          <Select options={modelOptions} disabled={!brandId} />
        </Form.Item>

        <Form.Item
          label="Số ghế"
          name="numberSeat"
          rules={[{ required: true, message: "Hãy chọn số ghế của xe!" }]}
        >
          <Select
            options={[
              { value: "2 chỗ", label: "2 chỗ" },
              { value: "4 chỗ", label: "4 chỗ" },
              { value: "5 chỗ", label: "5 chỗ" },
              { value: "7 chỗ", label: "7 chỗ" },
              { value: "9 chỗ", label: "9 chỗ" },
              { value: "12 chỗ", label: "12 chỗ" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Truyền động"
          name="transmissions"
          rules={[{ required: true, message: "Hãy chọn truyền động!" }]}
        >
          <Select
            options={[
              { value: "Số sàn", label: "Số sàn" },
              { value: "Số tự động", label: "Số tự động" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Biển số xe"
          name="numberCar"
          rules={[{ required: true, message: "Hãy nhập biển số xe!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Năm sản xuất"
          name="yearManufacture"
          rules={[{ required: true, message: "Hãy nhập năm sản xuất!" }]}
        >
          <InputNumber className="w-full" min={1800} max={2024} />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Hãy mô tả chiếc xe!" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Giá tiền thuê xe trong 1 ngày"
          name="cost"
          rules={[{ required: true, message: "Hãy nhập giá thuê xe!" }]}
        >
          <InputNumber
            className="w-full"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Form.Item>
      </div>

      <Form.Item className="col-span-2">
        <Button type="primary" htmlType="submit" block>
          {isInsert ? "Thêm xe" : "Cập nhật xe"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UpsertCarForm;
