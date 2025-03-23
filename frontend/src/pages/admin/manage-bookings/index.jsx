import { cancelBooking, getBookings } from "@/apis/admin-bookings.api";
import { GET_BOOKINGS_KEY } from "@/constants/react-query-key.constant";
import { AdminLayout } from "@/layouts/AdminLayout";
import { formatCurrency } from "@/utils/number.utils";
import moment from "moment";

import {
  CarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import axios from "axios";
import React, { useRef, useState } from "react";

import { UploadContract } from "@/components/UploadContract.jsx";
import { useAccessTokenValue } from "@/recoils/accessToken.state.js";
import { useUserState } from "@/recoils/user.state.js";
import ConvertApi from "convertapi-js";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import PizZip from "pizzip";
import Highlighter from "react-highlight-words";
let PizZipUtils = null;

const { Title, Text } = Typography;

if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

export default function AdminManageBookings() {
  const [fileScan, setFileScan] = useState(null);
  const [uploading, setUploading] = useState(false);

  const props = {
    beforeUpload: (file) => {
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileScan(file);
        return false;
      }
      message.error("Hãy chọn file docx");
    },
    fileScan,
  };

  const handleUpload = () => {
    setUploading(true);
    let convertApi = ConvertApi.auth("HwQQ18bFTPBXQcoj");
    let params = convertApi.createParams();
    params.add("file", fileScan);
    convertApi
      .convert("docx", "pdf", params)
      .then(async (result) => {
        let url = result.files[0].Url;
        saveAs(url, `${result.files[0].FileName}`);
        message.success("Scan file successfully.");
        setIsModalOpen(false);
        setFileScan(null);
      })
      .catch((err) => {
        message.error("Scan file failed.");
        setFileScan(null);
      })
      .finally(() => {
        setUploading(false);
        setIsModalOpen(false);
        setFileScan(null);
      });
  };

  ////////////////////////////////
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useUserState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [file, setFile] = useState(null);

  const accessToken = useAccessTokenValue();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [bookings, setBookings] = useState({});
  const searchInput = useRef(null);

  const router = useRouter();

  const showModalScanPDF = () => {
    setIsModalOpen(true);
  };
  const handleOkScan = () => {
    setIsModalOpen(false);
  };

  const handleCancelScan = () => {
    setIsModalOpen(false);
  };

  const generateDocument = (booking) => {
    loadFile(
      "https://firebasestorage.googleapis.com/v0/b/rental-945b7.appspot.com/o/pdfs%2Fhop_dong_thue_xe.docx?alt=media&token=53c0180b-1e6e-42b4-a8ad-88e9d181eae3",
      function (error, content) {
        if (error) {
          throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData({
          address: booking.address,
          fullName: booking?.fullname,
          phone: booking.phone,
          id: booking._id,
          phoneNumber: user?.result.phoneNumber,
          nameStaff: user?.result.fullname,
          role: user?.result.role === "staff" ? "Nhân viên" : "Quản lý",

          model: booking.model,
          yearManufacture: booking.yearManufacture,
          numberSeat: booking.numberSeat,
          numberCar: booking.numberCar,
          totalCost: booking.totalCost,
          timeBookingStart: booking.timeBookingStart,
          timeBookingEnd: booking.timeBookingEnd,
          day: moment().date(),
          month: moment().month() + 1,
          year: moment().year(),
        });
        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render();
        } catch (error) {
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
          function replaceErrors(key, value) {
            if (value instanceof Error) {
              return Object.getOwnPropertyNames(value).reduce(function (
                error,
                key
              ) {
                error[key] = value[key];
                return error;
              },
              {});
            }
            return value;
          }

          if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors
              .map(function (error) {
                return error.properties.explanation;
              })
              .join("\n");
            console.log("errorMessages", errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
          }
          throw error;
        }

        var out = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        saveAs(out, `hop_dong_${booking.fullname}_${booking.numberCar}.docx`);
      }
    );
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const onSubmit = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/contracts/create/${values._id}`,
        { images: values.images },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        message.success("Create Contract successfully");
        setOpen(false);
        refetch();
        // router.reload();
      } else {
        // Handle API errors and display an error message
        message.error("Error submitting the form. Please try again later.");
        setOpen(false);
        refetch();
      }
    } catch (apiError) {
      console.error("Error calling the API: ", apiError);
      message.error("Error submitting the form. Please try again later.");
      setOpen(false);
      refetch();
    }
  };

  const { mutate } = useMutation(onSubmit);

  const beforeUpload = (file) => {
    // Check if the uploaded file is a PDF
    if (
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setFile(file);
      return false; // Prevent the default upload action
    }

    message.error("Only PDF files are allowed.");
    return false;
  };

  const showModal = (booking) => {
    setOpen(true);
    setBookings({ ...booking });

    form.setFieldsValue({ ...booking });
  };
  const handleOk = () => {
    setLoading(true);
    setOpen(false);
    refetch();
  };
  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const { data, refetch } = useQuery({
    queryFn: getBookings,
    queryKey: [GET_BOOKINGS_KEY],
  });

  const dataSource = data?.result.map((item, idx) => ({
    id: idx + 1,
    _id: item._id,
    thumb: item?.carId?.thumb,
    numberCar: item?.carId?.numberCar,
    model: item?.carId?.model?.name,

    numberSeat: item?.carId?.numberSeat,
    yearManufacture: item?.carId?.yearManufacture,
    // username: item?.bookBy?.username,
    fullname: item?.bookBy?.fullname,
    phone: item?.phone,

    address: item?.address,

    totalCost: formatCurrency(item?.totalCost),

    timeBookingStart: moment(item?.timeBookingStart).format("DD-MM-YYYY HH:mm"),
    timeBookingEnd: moment(item?.timeBookingEnd).format("DD-MM-YYYY HH:mm"),

    codeTransaction: item?.codeTransaction,
    timeTransaction: item?.timeTransaction,
    status: item?.status,
  }));

  const cancelBook = useMutation(
    (bookingId) => cancelBooking(accessToken, bookingId),
    {
      onSuccess: () => {
        message.success("Hủy thành công");
        refetch();
      },

      onError: (error) => {
        message.error(`Hủy thất bại: ${error.message}`);
      },
    }
  );

  const columns = [
    { key: "id", title: "ID", dataIndex: "id", width: "4%" },
    {
      key: "thumb",
      title: "Ảnh",
      dataIndex: "thumb",

      render: (url) => (
        <Image
          className="h-32 aspect-video rounded-md object-cover"
          src={url}
        />
      ),
    },

    {
      key: "numberCar",
      title: "Số ghế",
      dataIndex: "numberCar",
      ...getColumnSearchProps("numberCar"),
    },
    {
      key: "fullname",
      title: "Khách hàng",
      dataIndex: "fullname",
      ...getColumnSearchProps("fullname"),
    },

    {
      key: "phone",
      title: "Số điện thoại",
      dataIndex: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      key: "address",
      title: "Địa chỉ nhận xe",
      dataIndex: "address",
      ...getColumnSearchProps("address"),
    },
    {
      key: "totalCost",
      title: "Tổng giá thuê",
      dataIndex: "totalCost",
      ...getColumnSearchProps("totalCost"),
    },
    {
      key: "timeBookingStart",
      title: "Thời gian bắt đầu",
      dataIndex: "timeBookingStart",
    },
    {
      key: "timeBookingEnd",
      title: "Thời gian kết thúc",
      dataIndex: "timeBookingEnd",
    },
    {
      key: "codeTransaction",
      title: "Mã giao dịch",
      dataIndex: "codeTransaction",
    },
    {
      key: "timeTransaction",
      title: "Thời gian giao dịch",
      dataIndex: "timeTransaction",
    },

    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      fixed: "right",
      // width: "%",
      filters: [
        {
          text: "Chưa Có Hợp Đồng",
          value: "Chưa có hợp đồng",
        },
        {
          text: "Đã Có Hợp Đồng",
          value: "Đã có hợp đồng",
        },
        {
          text: "Đã Hủy",
          value: "Đã hủy",
        },
      ],
      // filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status.includes(value),

      // ellipsis: true,
      render: (status) => (
        <>
          {status === "Chưa có hợp đồng" ? (
            <>
              <p className="text-red-500 justify-center">
                <MinusCircleOutlined
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginRight: "5px",
                  }}
                />
                Chưa Có Hợp Đồng
              </p>
            </>
          ) : status === "Đã có hợp đồng" ? (
            <>
              <p className="text-green-600">
                <CheckCircleOutlined
                  style={{
                    color: "green",
                    fontSize: "12px",
                    marginRight: "5px",
                  }}
                />
                Đã Có Hợp Đồng
              </p>
            </>
          ) : (
            <>
              <p className="text-red-500 flex justify-center ">
                <ExclamationCircleOutlined
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginRight: "5px",
                  }}
                />
                Đã Hủy
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "action",
      fixed: "right",
      width: "8%",
      render: (_, booking) => (
        <div className="flex gap-2">
          {booking.status === "Đã có hợp đồng" ||
          booking.status === "Đã hủy" ? (
            <Button
              type="primary"
              className=" border border-solid  "
              onClick={() => showModal(booking)}
              disabled
            >
              <PlusCircleOutlined style={{ fontSize: "14px" }} />
            </Button>
          ) : (
            <Tooltip
              placement="topLeft"
              title={"Tạo hợp đồng"}
              color={"rgb(74 222 128)"}
            >
              <Button
                type="primary"
                className=" border border-solid border-green-400 "
                onClick={() => showModal(booking)}
              >
                <PlusCircleOutlined style={{ fontSize: "14px" }} />
              </Button>
            </Tooltip>
          )}

          <Tooltip
            placement="top"
            title={"Tải file để tạo hợp đồng"}
            color="cyan"
          >
            <Button
              className=" border border-solid border-green-400 bg-cyan-400"
              onClick={() => generateDocument(booking)}
            >
              <DownloadOutlined style={{ fontSize: "14px" }} />
            </Button>
          </Tooltip>
          <Tooltip placement="topRight" title={"Hủy thuê xê"} color={"red"}>
            <Popconfirm
              title="Vô hiệu hóa thuê xe?"
              okText="Vô hiệu hóa"
              cancelText="Hủy bỏ"
              onConfirm={() => cancelBook.mutate(booking._id)}
            >
              <Button className="bg-red-500 text-white border-none hover:bg-red-500/70">
                <DeleteOutlined style={{ fontSize: "14px" }} />
              </Button>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} className="m-0">
          <CarOutlined className="mr-2" />
          Quản lý thuê xe
        </Title>
      </div>

      <div className="pt-14">
        <Table
          scroll={{ x: 768, y: 500 }}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} xe`,
          }}
        />
      </div>
      <Modal
        title="Tạo Hợp Đồng"
        open={open}
        onOk={handleOk}
        footer={null}
        width={700}
        onCancel={handleCancel}
      >
        <>
          <Form
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            layout="vertical"
            className="flex gap-4 mt-10"
          >
            <div className="w-2/3">
              <Form.Item label="Tên khách hàng" name="fullname">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="phone">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Biển số xe" name="numberCar">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Thời gian bắt đầu thuê" name="timeBookingStart">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Thời gian kết thúc thuê" name="timeBookingEnd">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Tổng giá tiền thuê" name="totalCost">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Booking id" hidden name="_id">
                <Input readOnly />
              </Form.Item>

              <div className=" mt-10">
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </div>
            </div>

            <div className="grow w-1/3">
              <Form.Item
                label="Ảnh hợp đồng"
                name="images"
                rules={[
                  {
                    required: true,
                    message: "Hãy đăng ảnh hợp đồng lên!",
                  },
                ]}
              >
                <UploadContract />
              </Form.Item>
            </div>
          </Form>
        </>
      </Modal>

      <Modal
        title="Scan PDF"
        open={isModalOpen}
        onOk={handleOkScan}
        onCancel={handleCancelScan}
        footer={false}
      >
        <>
          <Upload {...props} maxCount={1}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={!fileScan}
            loading={uploading}
            style={{
              marginTop: 16,
            }}
          >
            {uploading ? "Scanning" : "Start Scan"}
          </Button>
        </>
      </Modal>
    </div>
  );
}

AdminManageBookings.Layout = AdminLayout;
