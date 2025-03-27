import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useDriverState } from "@/recoils/driver.state.js";
import { useUserState } from "@/recoils/user.state.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UploadImageDrive } from "@/components/UploadImageDrive";
import axios from "axios";
import { Button, Form, notification, Modal, InputNumber, Select } from "antd";

export default function RegisterDriverModal({
  openRegisterDriver,
  handleCancleRegisterDriver,
}) {
  const [form] = Form.useForm();
  const [user, setUser] = useUserState();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile, clearProfile] = useLocalStorage("profile", "");
  const [driver, setDriver] = useDriverState();

  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");

  useEffect(() => {
    setDriver(profile);
  });

  const onSubmit = async (values) => {
    setLoading(true);

    try {
      const did = driver?.result?._id || user?.result?.driverLicenses?._id;

      const response = await axios({
        method: did ? "put" : "post", // Use PUT if there's an existing driver ID, otherwise use POST
        url: did
          ? `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/drivers/updateDriver/${did}`
          : `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/drivers/registerDriver`,
        data: values,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          withCredentials: true,
        },
      });

      if (response.status === 200) {
        setDriver({ ...response.data });
        setProfile({ ...response.data });
        handleCancleRegisterDriver();
        const successMessage =
          driver || user?.result?.driverLicenses
            ? "Cập nhật thành công"
            : "Đăng kí thành công";

        notification.success({
          message: successMessage,
        });
      } else {
        console.log(error.response.data.errors[0].msg);
      }
    } catch (error) {
      toast.error(error.response.data.errors[0].msg, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setLoading(false);
    }
  };
  const { mutate, isLoading } = useMutation(onSubmit, {
    onMutate: () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
  });

  return (
    <Modal
      open={openRegisterDriver}
      onCancel={handleCancleRegisterDriver}
      footer={[
        <Button
          loading={isLoading}
          htmlType="submit"
          type="primary"
          onClick={() => mutate(form.getFieldsValue())}
        >
          {driver || user?.result?.driverLicenses ? "Cập nhật" : " Đăng kí"}
        </Button>,
      ]}
    >
      <p className="flex justify-center items-center w-full text-2xl font-bold">
        {driver || user?.result?.driverLicenses
          ? "Cập nhật GPLX"
          : "Đăng kí GPLX"}
      </p>

      <Form
        form={form}
        layout="vertical"
        name="basic"
        onFinish={(values) => {
          mutate(values);
        }}
        label
        initialValues={{
          ...(driver?.result || {}),
          ...(user?.result?.driverLicenses || {}),
        }}
        autoComplete="off"
        className="flex gap-4 mt-10"
      >
        <div className="w-2/3">
          <Form.Item
            label="Số GPLX"
            name="drivingLicenseNo"
            rules={[
              {
                required: true,
                message: "Số GPLX không được để trống!",
              },
            ]}
            hasFeedback
          >
            <InputNumber className="w-full" />
          </Form.Item>

          <Form.Item label="Hạng" name="class" required hasFeedback>
            <Select
              className="py-0"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.value.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toLowerCase())
              }
              options={[
                { value: "B1" },
                { value: "B2" },
                { value: "C" },
                { value: "D" },
                { value: "E" },
                { value: "F" },
                { value: "FB2" },
                { value: "FC" },
                { value: "FD" },
                { value: "FE" },
              ]}
            />
          </Form.Item>
        </div>

        <div className="grow w-1/3">
          <Form.Item label="Hình ảnh" name="image" required>
            <UploadImageDrive />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
