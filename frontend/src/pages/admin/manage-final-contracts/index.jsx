import { AdminLayout } from "@/layouts/AdminLayout";
import moment from "moment";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { CarOutlined, SearchOutlined } from "@ant-design/icons";
import { Worker } from "@react-pdf-viewer/core";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Image,
  Input,
  message,
  Modal,
  Space,
  Table,
  Typography,
} from "antd";
import { useRef, useState } from "react";
// Import the main component
import { Viewer } from "@react-pdf-viewer/core";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useRouter } from "next/router";
import Highlighter from "react-highlight-words";

import { getFinalContracts } from "@/apis/admin-final-contracts.api.js";
import { GET_FINAL_CONTRACTS_KEY } from "@/constants/react-query-key.constant";
// Import styles
import { UploadContract } from "@/components/UploadContract.jsx";
import { useUserState } from "@/recoils/user.state.js";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
let PizZipUtils = null;
if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}
const { Title, Text } = Typography;

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}
export default function AdminManageContracts() {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [user, setUser] = useUserState();
  const [urlFile, setUrlFile] = useState("");

  const [form] = Form.useForm();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [accessToken] = useLocalStorage("access_token");

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const router = useRouter();
  const [filteredInfo, setFilteredInfo] = useState({});
  const handleChange = (pagination, filters) => {
    setFilteredInfo(filters);
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

  const generateDocument = (contract) => {
    loadFile(
      "https://firebasestorage.googleapis.com/v0/b/rental-945b7.appspot.com/o/pdfs%2Ftat_toan_hop_dong_thue_xe.docx?alt=media&token=f2e3ec7c-bd2d-457a-95ec-90aaed59e5a3",
      function (error, content) {
        if (error) {
          throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData({
          address: contract.address,
          fullName: contract.bookBy,
          phone: contract.phone,
          id: contract.bookingId,
          phoneNumber: user?.result.phoneNumber,
          nameStaff: user?.result.fullname,
          role: user?.result.role === "staff" ? "Nhân viên" : "Quản lý",

          model: contract.model,
          yearManufacture: contract.yearManufacture,
          numberSeat: contract.numberSeat,
          numberCar: contract.numberCar,
          totalCost: contract.totalCost,
          timeBookingStart: contract.timeBookingStart,
          timeBookingEnd: contract.timeBookingEnd,

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
          console.log(JSON.stringify({ error: error }, replaceErrors));

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

        saveAs(
          out,
          `Tat_toan_hop_dong_${contract.bookBy}_${contract.numberCar}.docx`
        );
      }
    );
  };

  const onSubmit = async (values) => {
    try {
      setTimeout(() => {
        setOpen(false);
      }, 500);
      console.log(moment(values.timeFinish).format("YYYY-MM-DD"));
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/final-contracts/create/${values._id}`,
        {
          images: values?.images,
          timeFinish: moment(values?.timeFinish.format("YYYY-MM-DD"))._i,

          cost_settlement: values?.cost_settlement,
          note: values?.note,
        },
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
        // router.reload();
      } else {
        // Handle API errors and display an error message
        message.error("Error submitting the form. Please try again later.");
      }
    } catch (apiError) {
      console.error("Error calling the API: ", apiError);
      message.error("Error submitting the form. Please try again later.");
    }
  };

  const { mutate } = useMutation(onSubmit);

  const beforeUpload = (file) => {
    // Check if the uploaded file is a PDF
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed.");
      return false;
    }

    // Update the state with the selected file
    setFile(file);
    return false; // Prevent the default upload action
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModalView = (contract) => {
    setIsModalOpen(true);
    console.log(contract.file);

    setUrlFile(contract.file);
  };

  const handleOkView = () => {
    setIsModalOpen(false);
  };

  const handleCancelView = () => {
    setIsModalOpen(false);
  };

  const showModal = (booking) => {
    setOpen(true);

    form.setFieldsValue({ ...booking });
  };
  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };
  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const { data } = useQuery({
    queryKey: [GET_FINAL_CONTRACTS_KEY, accessToken, user?.result?.role],
    queryFn: async () =>
      await getFinalContracts(accessToken, user?.result?.role),
  });

  const dataSource = data?.result.map((item, idx) => ({
    id: idx + 1,
    _id: item?._id,
    bookingId: item?.contractId?.bookingId?._id,
    image: item?.images,
    createBy: item?.contractId?.createBy?.fullname,
    bookBy: item?.contractId?.bookingId?.bookBy?.fullname,
    email: item?.contractId?.bookingId?.bookBy?.email,
    phone: item?.contractId?.bookingId?.phone,
    address: item?.contractId?.bookingId?.address,

    numberCar: item?.contractId?.bookingId?.carId?.numberCar,
    model: item?.contractId?.bookingId?.carId?.model?.name,

    numberSeat: item?.contractId?.bookingId?.carId?.numberSeat,
    yearManufacture: item?.contractId?.bookingId?.carId?.yearManufacture,

    timeBookingStart: moment(
      item?.contractId?.bookingId?.timeBookingStart
    ).format("DD-MM-YYYY"),
    timeBookingEnd: moment(item?.timeFinish).format("DD-MM-YYYY"),
    totalCost: item?.cost_settlement,

    status: item?.status,
  }));

  const columns = [
    { key: "id", title: "ID", dataIndex: "id", width: "4%" },
    {
      key: "image",
      title: "Ảnh tất toán hợp đồng",
      dataIndex: "image",

      render: (images) => (
        <Image.PreviewGroup
          preview={{
            onChange: (current, prev) =>
              console.log(`current index: ${current}, prev index: ${prev}`),
          }}
          items={images}
        >
          <Image
            className="h-32 aspect-video rounded-md object-cover"
            src={images[0]}
          />
        </Image.PreviewGroup>
      ),
    },
    // {
    //   key: "createBy",
    //   title: "Người Tạo Hợp Đồng",
    //   dataIndex: "createBy",
    //   ...getColumnSearchProps("createBy"),
    // },
    {
      key: "bookBy",
      title: "Tên Khách Hàng",
      dataIndex: "bookBy",
      ...getColumnSearchProps("bookBy"),
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      ...getColumnSearchProps("email"),
    },

    {
      key: "phone",
      title: "Số Điện Thoại",
      dataIndex: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      key: "addres",
      title: "Điạ Chỉ",
      dataIndex: "address",
      ...getColumnSearchProps("address"),
    },
    {
      key: "totalCost",
      title: "Số tiền kết toán",
      dataIndex: "totalCost",
    },
    {
      key: "timeBookingStart",
      title: "Thời Gian Bắt Đầu",
      dataIndex: "timeBookingStart",
    },
    {
      key: "timeBookingEnd",
      title: "Thời Gian Kết Thúc",
      dataIndex: "timeBookingEnd",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} className="m-0">
          <CarOutlined className="mr-2" />
          Quản lý hợp đồng tất toán
        </Title>
      </div>
      <Table
        onChange={handleChange}
        scroll={{ x: 768, y: 500 }}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} hợp đồng`,
        }}
      />
      <Modal
        title="Tất toán hợp đồng"
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
              <Form.Item label="Tên khách hàng" name="bookBy">
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
              <Form.Item label="Contract id" hidden name="_id">
                <Input />
              </Form.Item>

              <h2>Trả xe trước thời hạn(nếu có)</h2>
              <Form.Item label="Thời gian kết thúc thuê" name="timeFinish">
                <DatePicker format="DD-MM-YYYY" />
              </Form.Item>
              <Form.Item
                label="Giá trị kết toán hợp đồng"
                name="cost_settlement"
              >
                <Input />
              </Form.Item>
              <Form.Item label="Ghi chú" name="note">
                <Input />
              </Form.Item>

              <div className=" mt-10">
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </div>
            </div>

            <div className="grow w-1/3">
              <Form.Item label="Images" name="images">
                <UploadContract />
              </Form.Item>
            </div>
          </Form>
        </>
      </Modal>

      <Modal
        title="Hợp Đồng"
        open={isModalOpen}
        onOk={handleOkView}
        footer={null}
        width={1000}
        onCancel={handleCancelView}
      >
        <div>
          {/* <Loader isLoading={isLoading} /> */}
          <section
            id="pdf-section"
            className="d-flex flex-column align-items-center w-100"
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.14.305/build/pdf.worker.min.js">
              <Viewer
                fileUrl={urlFile}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
            {/* <embed
              type="application/pdf"
              src={urlFile}
              width={100 + "%"}
              height={100 + "%"}
            /> */}
          </section>
        </div>
      </Modal>
    </div>
  );
}

AdminManageContracts.Layout = AdminLayout;
