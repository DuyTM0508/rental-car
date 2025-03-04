import React from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  GET_COUPONS,
  GET_COUPON_BY_ID,
} from "@/constants/react-query-key.constant";

import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "@/apis/admin-coupons.api";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Skeleton,
  message,
  Table,
  Tooltip,
  DatePicker,
} from "antd";
import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import moment from "moment";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
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
  const [accessToken] = useLocalStorage("access_token");

  const [upsertCouponModal, setUpsertCouponModal] = useState();
  const { data, refetch } = useQuery({
    queryFn: getCoupons,
    queryKey: [GET_COUPONS],
  });

  const dataSource = data?.result.map((item, idx) => ({
    id: idx + 1,
    _id: item?._id,
    name: item?.name,
    discount: item?.discount,
    description: item?.description,
    timeExpired: moment(item?.timeExpired).format("YYYY-MM-DD HH:mm"),
  }));
  const handleInsertCoupon = () => {
    setUpsertCouponModal({ actionType: "insert" });
  };
  console.log(upsertCouponModal);

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

  return (
    <>
      <div className="pt-10 px-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Button type="primary" onClick={handleInsertCoupon}>
              <PlusOutlined /> Tạo mã giảm giá
            </Button>
          </div>
        </div>

        <Table
          scroll={{ y: 480 }}
          pagination={{ pageSize: 10 }}
          columns={[
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
                  <Tooltip
                    placement="top"
                    title={"Chỉnh sửa xe"}
                    color="#108ee9"
                  >
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
          ]}
          dataSource={dataSource}
          rowKey="id"
        />
      </div>
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
    </>
  );
}
AdminManageCoupon.Layout = AdminLayout;
