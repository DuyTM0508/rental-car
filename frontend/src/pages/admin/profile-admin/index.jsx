import { UploadProfilePictureAdmin } from "@/components/UploadProfilePictureAdmin";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useUserState } from "@/recoils/user.state.js";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, notification } from "antd";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";

export default function AdminProfile() {
  const [user, setUser] = useUserState();
  const router = useRouter();
  const [form] = Form.useForm();
  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");

  const updateProfile = async (values) => {
    const userId = user?.id;
    try {
      console.log(userId);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/update-user/${userId}`,
        values,

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            withCredentials: true,
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);
        setUser({ ...response.data });
        notification.success({
          message: "Cập nhật thành công",
        });
      } else {
        console.log(error.response.data.errors[0].msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { mutate } = useMutation(updateProfile);

  return (
    <div className="flex flex-grow ">
      <div
        className="flex flex-col   mt-5 mx-5 relative border rounded-xl border-solid border-neutral-200  p-4 h-96"
        style={{
          width: "30%",
          boxShadow: "0 .25rem 1.125rem rgba(75,70,92,.1)",
        }}
      >
        <div className="flex w-full flex-col justify-center items-center ">
          <div className="flex  top-0 w-full justify-center h-24 bg-[url('https://res.cloudinary.com/djllhxlfc/image/upload/v1700751397/cars/profile-cover_xzzgvs.jpg')]">
            <div className="flex mx-auto pt-10 ">
              {" "}
              <UploadProfilePictureAdmin />
            </div>
          </div>

          <div className="flex flex-col mt-10 ">
            <h5 className="text-lg font-semibold text-center mt-1 mb-2 ">
              {user?.result?.fullname}
            </h5>

            <p className="mt-0">
              Tham gia: {moment(user?.result?.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col mt-5 mx-5 relative border rounded-xl border-solid border-neutral-200 p-4 h-fit "
        style={{
          width: "70%",
          boxShadow: "0 .25rem 1.125rem rgba(75,70,92,.1)",
        }}
      >
        <h2 className="flex ml-0 text-2x justify-center">Thông tin cá nhân</h2>
        <div>
          <Form
            layout="vertical"
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            initialValues={{}}
            autoComplete="off"
            className="flex gap-4 mt-5"
          >
            <div className="w-full ">
              <div className="flex flex-row ">
                {/* <Form.Item
                  className="w-full mr-5  "
                  label="Username"
                  name="username"
                >
                  <Input
                    defaultValue={user?.result?.username}
                    className="py-3 px-3"
                  />
                </Form.Item> */}

                <Form.Item name="fullname" className="w-full" label="Họ và tên">
                  <Input
                    defaultValue={user?.result?.fullname}
                    className="py-3 px-3"
                  />
                </Form.Item>
              </div>
              <div className="flex flex-row ">
                <Form.Item name="email" className="w-full mr-5 " label="Email">
                  <Input
                    defaultValue={user?.result?.email}
                    className="py-3 px-3"
                  />
                </Form.Item>
                <Form.Item
                  name="date_of_birth"
                  className="w-full "
                  label="Ngày sinh"
                >
                  <Input
                    defaultValue={user?.result?.date_of_birth}
                    className="py-3 px-3"
                  />
                </Form.Item>
              </div>
              <div className="flex flex-row ">
                <Form.Item
                  name="address"
                  className="w-full mr-5"
                  label="Địa chỉ"
                >
                  <Input
                    defaultValue={user?.result?.address}
                    className="py-3 px-3"
                  />
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  className="w-full"
                  label="Số điện thoại"
                >
                  <Input
                    defaultValue={user?.result?.phoneNumber}
                    className="py-3 px-3"
                  />
                </Form.Item>
              </div>
              <Form.Item>
                <div className="flex justify-center">
                  <Button
                    className="flex p-4 items-center justify-center"
                    type="primary"
                    htmlType="submit"
                  >
                    Lưu
                  </Button>
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

AdminProfile.Layout = AdminLayout;
