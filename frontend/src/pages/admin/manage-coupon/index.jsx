import {
  GET_COUPONS,
  GET_COUPON_BY_ID,
} from "@/constants/react-query-key.constant";
import { AdminLayout } from "@/layouts/AdminLayout";
import React from "react";

import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
} from "@/apis/admin-coupons.api";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  CarOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Skeleton,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import moment from "moment";
import { useState } from "react";
dayjs.extend(utc);
dayjs.extend(timezone);
const { Title, Text } = Typography;

function UpsertCouponForm({ couponId, onOk }) {
  const [accessToken] = useLocalStorage("access_token");
  console.log(couponId);

  const isInsert = !couponId;

  const [form] = Form.useForm();
  console.log(couponId);
  const couponDetail = useQuery({
    queryFn: () => getCouponById(couponId, accessToken),
    queryKey: [GET_COUPON_BY_ID, couponId],
  });

  const apiCreateCoupon = useMutation({
    mutationFn: createCoupon,
  });

  const apiUpdateCoupon = useMutation({
    mutationFn: updateCoupon,
  });

  if (couponDetail.isLoading) {
    return <Skeleton active />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      className="flex flex-col gap-4 mt-10"
      initialValues={{
        ...couponDetail.data?.result,
        timeExpired:
          couponId === undefined
            ? null
            : dayjs(couponDetail?.data?.result?.timeExpired).tz(
                "Asia/Ho_Chi_Minh"
              ),
      }}
      onFinish={async (values) => {
        console.log(values, couponId);

        if (isInsert) {
          await apiCreateCoupon.mutateAsync({
            body: { ...values },
            accessToken,
          });
          console.log({ values });
        } else {
          console.log({ values });
          await apiUpdateCoupon.mutateAsync({
            couponId,
            body: { ...values },
            accessToken,
          });
        }

        onOk?.();
      }}
    >
      <div className="h-[60vh] flex gap-2">
        <div className="w-full">
          <Form.Item label="Tên Mã Giảm Giá" required name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Mức giảm giá" required name="discount">
            <InputNumber className="w-[354px]" />
          </Form.Item>
          <Form.Item label="Mô tả chi tiết" required name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Ngày hết hạn" name="timeExpired">
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD-MM-YYYY HH:mm"
              size="large"
            />
          </Form.Item>
          <div className="flex justify-center mt-10">
            <Button type="primary" htmlType="submit">
              {isInsert ? "Add" : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default function AdminManageCoupon() {
  const [searchText, setSearchText] = useState("");
  const [accessToken] = useLocalStorage("access_token");

  const [upsertCouponModal, setUpsertCouponModal] = useState();
  const { data, refetch } = useQuery({
    queryFn: getCoupons,
    queryKey: [GET_COUPONS],
  });

  const dataSource = data?.result
    .map((item, idx) => ({
      id: idx + 1,
      _id: item?._id,
      name: item?.name,
      discount: item?.discount,
      description: item?.description,
      timeExpired: moment(item?.timeExpired).format("YYYY-MM-DD HH:mm"),
    }))
    .filter((item) => {
      return (
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  const handleInsertCoupon = () => {
    setUpsertCouponModal({ actionType: "insert" });
  };

  // const handleInsertCoupon = () => {
  //   setUpsertCouponModal({ actionType: "insert" });
  // };
  const deleteCouponMt = useMutation(
    (couponId) => deleteCoupon(couponId, accessToken),
    {
      onSuccess: () => {
        message.success("Xoá thành công");
        refetch();
      },

      onError: (error) => {
        message.error(`Xoá thất bại: ${error.message}`);
      },
    }
  );

  const columns = [
    { key: "id", title: "ID", dataIndex: "id", width: "60px" },
    {
      key: "name",
      title: "Mã giảm giá",
      dataIndex: "name",
    },
    { key: "discount", title: "Mức giảm giá", dataIndex: "discount" },
    {
      key: "description",
      title: "Mô tả chi tiết",
      dataIndex: "description",
    },
    {
      key: "timeExpired",
      title: "Ngày hết hạn",
      dataIndex: "timeExpired",
    },
    {
      key: "action",
      render: (_, coupon) => (
        <div className="flex gap-2">
          <Tooltip placement="top" title={"Chỉnh sửa xe"} color="#108ee9">
            <Button
              className="bg-blue-500 text-white border-none hover:bg-blue-500/70"
              onClick={() => {
                setUpsertCouponModal({
                  actionType: "update",
                  couponId: coupon._id,
                });
              }}
            >
              <EditOutlined />
            </Button>
          </Tooltip>

          <Popconfirm
            title="Bạn có chắc chắn muốn xoá coupon này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteCouponMt.mutate(coupon._id)}
          >
            <Button className="bg-red-500 text-white border-none hover:bg-red-500/70">
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} className="m-0">
          <CarOutlined className="mr-2" />
          Quản lý mã giảm giá
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm mã giảm giá..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleInsertCoupon}
          >
            Thêm mã giảm giá mới
          </Button>
        </Space>
      </div>
      <Table
        scroll={{ x: 768, y: 500 }}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} mã giảm giá`,
        }}
      />
      <Modal
        open={upsertCouponModal}
        title={
          upsertCouponModal?.actionType === "insert"
            ? "Tạo mới mã giảm giá"
            : "Cập nhật mã giảm giá"
        }
        width={400}
        destroyOnClose
        footer={null}
        onCancel={() => setUpsertCouponModal(undefined)}
      >
        <UpsertCouponForm
          couponId={upsertCouponModal?.couponId}
          onOk={() => {
            setUpsertCouponModal(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
}
AdminManageCoupon.Layout = AdminLayout;
