import { Image, Spin, Upload, message } from "antd";
import {
  CloseCircleFilled,
  CloseCircleOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  DeleteFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";

export const UploadContract = ({ value, onChange }) => {
  const endpoint = `https://api.cloudinary.com/v1_1/djllhxlfc/image/upload`;
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const computedValue = value ?? images;

  return (
    <>
      {contextHolder}

      <div className="grid gap-2 grid-cols-3">
        {computedValue?.map((image) => (
          <div
            key={image}
            className="rounded overflow-hidden aspect-square relative"
          >
            <CloseCircleFilled
              className="absolute z-50 cursor-pointer right-0 top-0 text-red-500"
              onClick={() => {
                const newImages = images.filter((e) => e !== image);

                setImages(newImages);
                onChange(newImages);
              }}
            />
            <Image
              src={image}
              className="w-full h-full object-contain aspect-square"
            />
          </div>
        ))}

        <Upload.Dragger
          listType="picture-card"
          showUploadList={false}
          className="aspect-square p-0"
          customRequest={async ({ file }) => {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "contracts");

            try {
              const { data } = await axios.post(endpoint, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });

              const newImages = [...images, data.url];

              setImages(newImages);
              onChange?.(newImages);
            } catch (error) {
              messageApi.error(String(error));
            } finally {
              setLoading(false);
            }
          }}
        >
          <Spin spinning={loading}>
            <CloudUploadOutlined />
          </Spin>
        </Upload.Dragger>
      </div>
    </>
  );
};
