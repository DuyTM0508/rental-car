import { Image, Spin, Upload, message, notification } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useUserState } from "@/recoils/user.state.js";
import useLocalStorage from "@/hooks/useLocalStorage";
import axios from "axios";
import { useState } from "react";

export const UploadProfilePicture = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useUserState();

  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");

  const updateProfile = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    const userId = user?.id;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
            withCredentials: true,
          },
        }
      );

      if (response.status === 200) {
        setUser((user) => ({
          ...user,
          result: {
            ...user.result,
            profilePicture: response.data.result.profilePicture,
          },
        }));

        notification.success({
          message: "Cập nhật thành công",
        });
      } else {
        notification.error({
          message: "Cập nhật không thành công",
        });
      }
    } catch (error) {
      notification.error({
        message: "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Upload.Dragger
        listType="picture-card"
        showUploadList={false}
        className="aspect-square w-2/3 "
        customRequest={({ file }) => updateProfile(file)}
      >
        <Spin spinning={loading}>
          <div className="py-0 p-2 relative group   ">
            {user?.result?.profilePicture ? (
              <Image
                className="w-full h-full  object-cover aspect-square rounded overflow-hidden mt-0"
                preview={false}
                src={user?.result?.profilePicture}
              />
            ) : (
              <CloudUploadOutlined />
            )}

            <div className="absolute w-full h-full top-0 left-0 bg-white/80 opacity-0 hover:opacity-100 flex justify-center items-center transition-all">
              <CloudUploadOutlined />
            </div>
          </div>
        </Spin>
      </Upload.Dragger>
    </>
  );
};
