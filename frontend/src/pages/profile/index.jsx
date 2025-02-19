import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state.js";
import moment from "moment";
import { Typography, Button, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";

import styled from "@emotion/styled";
import { apiClient } from "@/apis/client";
import { ProfileLayout } from "@/layouts/ProfileLayout";
import EditProfileModal from "@/components/EditProfileModal";
import { UploadProfilePicture } from "@/components/UploadProfilePicture";
const { Title } = Typography;
const StyleInput = styled(Input)`
  display: flex;
  align-items: center;
  padding: 12px;
  width: 100%;
`;

export default function AccountPage() {
  const [openEditModal, setOpenEditModal] = useState(false);
  const showModalEdit = () => setOpenEditModal(true);
  const handleCancleEditModal = () => setOpenEditModal(false);

  const [user, setUser] = useUserState();
  const [profile, setProfile, clearProfile] = useLocalStorage("profile", "");

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getProfile = async () => {
      try {
        const value = window.localStorage.getItem("access_token");

        if (value !== null) {
          const { data } = await apiClient.request({
            method: "GET",
            url: "/users/get-user",
            headers: {
              Authorization: `Bearer ${JSON.parse(value)}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          console.log(data);
          // Update the Recoil state with the fetched user data
          setUser(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProfile(); // Call the fetchData function
  }, [setUser]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-grow relative p-4  ">
        <div
          className="flex flex-col relative justify-center items-center"
          style={{
            width: "30%",
          }}
        >
          <div className="flex flex-row">
            <p className="font-semibold text-xl mt-0">Thông tin tài khoản</p>
            <Button
              className="flex items-center ml-2"
              style={{
                padding: "8px",
                border: "1px solid #e0e0e0",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              onClick={showModalEdit}
            >
              <EditOutlined />
            </Button>
            <EditProfileModal
              openEditModal={openEditModal}
              handleCancleEditModal={handleCancleEditModal}
            />
          </div>

          <div className="flex w-full flex-col justify-center items-center mx-auto ">
            <UploadProfilePicture />
          </div>
          <div className="flex flex-col mt-2 ">
            <h5 className="text-lg font-semibold text-center mt-1 mb-2 ">
              {user?.result?.fullname}
            </h5>

            <p className="mt-0">
              Tham gia: {moment(user?.result?.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>

        <div className="flex flex-col w-[calc(100%-30%)] mt-12 ">
          <div className="flex flex-col    ">
            <div className="flex flex-row">
              <p className="m-0 text-base font-semibold flex w-full ">
                {" "}
                Địa chỉ{" "}
              </p>
              <p className="m-0 text-xl font-semibold text-gray-500 flex w-full">
                {user?.result?.address}
              </p>
            </div>
            <hr
              className="w-full"
              style={{
                margin: "1rem 0",
                color: "inherit",
                opacity: ".25",
              }}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row w-full  ">
              <p className="mt-0 mb-0 text-base font-semibold flex w-full ">
                {" "}
                Email
              </p>
              <p className="mt-0 mb-0 text-xl font-semibold text-gray-500 flex w-full">
                {" "}
                {user?.result?.email}
              </p>
            </div>
            <hr
              className="w-full"
              style={{
                margin: "1rem 0",
                color: "inherit",
                opacity: ".25",
              }}
            />
          </div>

          <div className="flex flex-col  ">
            <div className="flex flex-row w-full ">
              <p className="mt-0 mb-0 text-base font-semibold flex w-full ">
                {" "}
                Số điện thoại
              </p>
              <p className="mt-0 mb-0 text-xl font-semibold text-gray-500 flex w-full">
                {" "}
                {user?.result?.phoneNumber}
              </p>
            </div>
            <hr
              className="w-full"
              style={{
                margin: "1rem 0",
                color: "inherit",
                opacity: ".25",
              }}
            />
          </div>

          <div className="flex flex-col ">
            <div className="flex flex-row w-full ">
              <p className="mt-0 mb-0 text-base font-semibold flex w-full ">
                {" "}
                Giới tính
              </p>
              <p className="mt-0 mb-0 text-xl font-semibold text-gray-500 flex w-full">
                {" "}
                Nam
              </p>
            </div>
            <hr
              className="w-full"
              style={{
                margin: "1rem 0",
                color: "inherit",
                opacity: "0.25",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
AccountPage.Layout = ProfileLayout;
