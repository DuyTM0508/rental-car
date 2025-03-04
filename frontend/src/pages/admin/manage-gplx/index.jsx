import { GET_GPLX_KEY } from "@/constants/react-query-key.constant";
import {
  acceptLicensesDriver,
  getGPLX,
  deleteDriverLicense,
} from "@/apis/gplx.api";
import { AdminLayout } from "@/layouts/AdminLayout";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, Image, Button, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function AdminManageGPLX() {
  const [accessToken] = useLocalStorage("access_token");
  const { data: gplx, refetch } = useQuery({
    queryKey: [GET_GPLX_KEY],
    queryFn: () => getGPLX(accessToken),
  });

  const deleteGPLX = useMutation(
    (driverId) => deleteDriverLicense(driverId, accessToken),
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
  const dataSource = gplx?.result.map((item, idx) => ({
    driverId: item?._id,
    id: idx + 1,
    img: item?.image,
    drivingLicenseNo: item?.drivingLicenseNo,
    class: item?.class,
    status: item?.status,
  }));

  const acceptGPLX = useMutation(
    (driverId) => acceptLicensesDriver(accessToken, driverId),
    {
      onSuccess: () => {
        message.success("Duyệt thành công");
        refetch();
      },

      onError: (error) => {
        message.error(`Duyệt thất bại: ${error.message}`);
      },
    }
  );
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  return (
    <div className="pt-10 px-4">
      <Table
        scroll={{ y: 480 }}
        pagination={{ pageSize: 10 }}
        columns={[
          { key: "id", title: "ID", dataIndex: "id", width: "60px" },
          {
            key: "img",
            title: "Ảnh bằng lái xe",
            dataIndex: "img",
            render: (url) => (
              <Image
                className="h-32 aspect-video rounded-md object-cover"
                src={url}
              />
            ),
          },
          {
            key: "drivingLicenseNo",
            title: "Số Bằng lái xe",
            dataIndex: "drivingLicenseNo",
            filterSearch: true,
            onFilter: (value, record) =>
              record.drivingLicenseNo.startsWith(value),
          },
          {
            key: "class",
            title: "Hạng",
            dataIndex: "class",
          },
          {
            key: "status",
            title: "Trạng thái",
            dataIndex: "status",
            filters: [
              {
                text: "Chưa xác thực",
                value: "Chưa xác thực",
              },
              {
                text: "Đã xác thực",
                value: "Đã xác thực",
              },
            ],
            onFilter: (value, record) => record.status.startsWith(value),
            render: (status) => (
              <>
                {status === "Chưa xác thực" ? (
                  <>
                    <div className="flex gap-2">
                      <p className="text-red-500">Chưa xác thực</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <p className="text-green-500">Đã xác thực</p>
                    </div>
                  </>
                )}
              </>
            ),
          },
          {
            key: "action",
            render: (record) => (
              <div className="flex gap-2">
                <Popconfirm
                  title="Bạn có chắc chắn duyệt bằng lái xe này?"
                  okText="Duyệt"
                  cancelText="Hủy"
                  onConfirm={() => acceptGPLX.mutate(record.driverId)}
                >
                  {record.status === "Chưa xác thực" ? (
                    <Button className="bg-red-500 text-white border-none hover:bg-red-500/70">
                      Duyệt
                    </Button>
                  ) : (
                    <Button className=" text-white border-none" disabled>
                      Duyệt
                    </Button>
                  )}
                </Popconfirm>

                <Popconfirm
                  title="Bạn có chắc chắn xóa bằng lái xe này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => deleteGPLX.mutate(record.driverId)}
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
        onChange={onChange}
      />
    </div>
  );
}

AdminManageGPLX.Layout = AdminLayout;
