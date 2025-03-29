import { AdminLayout } from "@/layouts/AdminLayout";
import { formatCurrency } from "@/utils/number.utils";
import moment from "moment";

import axios from "axios";

import { getListContracts } from "@/apis/admin-contracts.api.js";
import {
  CarOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
// Import the main component

// Import the styles
import { GET_LIST_CONTRACTS_KEY } from "@/constants/react-query-key.constant";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useRouter } from "next/router";
import Highlighter from "react-highlight-words";
// Import styles
import { UploadContract } from "@/components/UploadContract.jsx";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state.js";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
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
  const [days, setDays] = useState();
  const [lateDays, setLateDays] = useState(0);
  const [returnType, setReturnType] = useState(null); // 'early' or 'late' or null
  const [filteredInfo, setFilteredInfo] = useState({});
  const handleChange = (pagination, filters) => {
    setFilteredInfo(filters);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  function dateDiffInDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;

    const timeDiff = Math.abs(date1.getTime() - date2.getTime());

    const diffDays = Math.round(timeDiff / oneDay);

    return diffDays;
  }

  useEffect(() => {
    // Tính toán giá trị mới cho amount dựa trên totalDays

    const newAmount =
      form.getFieldValue("totalCostNumber") -
      (form.getFieldValue("cost") * days * 70) / 100;

    console.log(newAmount);
    // Cập nhật initialValues
    form.setFieldsValue({
      cost_settlement: newAmount || null, // Định dạng số tiền theo ý muốn
    });
  }, [days]);

  const handleDays = (value) => {
    if (!value) {
      setReturnType(null);
      return;
    }
    
    setReturnType('early');
    console.log(value);
    const startDate = new Date(moment(value?.format("YYYY-MM-DD"))?._i);

    const arrayDayEnd = form
      .getFieldValue("timeBookingEnd")
      .split(" ")[0]
      .split("-");
    const endDate = new Date(
      `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
    );
    // const endDate = new Date(
    //   moment(
    //     moment(form.getFieldValue("timeBookingEnd")).format("YYYY-DD-MM")
    //   )?._i
    // );
    const totalDays = dateDiffInDays(endDate, startDate);
    setDays(totalDays);
    
    // Clear late return fields
    form.setFieldsValue({
      lateTimeFinish: null,
      lateDays: null,
      latePenalty: null,
      late_cost_settlement: null
    });
  };

  const handleLateDays = (value) => {
    if (!value) {
      setReturnType(null);
      return;
    }
    
    setReturnType('late');
    const returnDate = new Date(moment(value?.format("YYYY-MM-DD"))?._i);

    const arrayDayEnd = form
      .getFieldValue("timeBookingEnd")
      .split(" ")[0]
      .split("-");
    const endDate = new Date(
      `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
    );

    // Only calculate if return date is after end date
    if (returnDate > endDate) {
      const totalLateDays = dateDiffInDays(returnDate, endDate);
      setLateDays(totalLateDays);

      // Calculate penalty (10% of daily rate per late day)
      const dailyRate = form.getFieldValue("cost");
      const penaltyAmount = dailyRate * 0.1 * totalLateDays;

      // Update settlement cost with penalty
      const newAmount = form.getFieldValue("totalCostNumber") + penaltyAmount;

      form.setFieldsValue({
        late_cost_settlement: newAmount,
        latePenalty: penaltyAmount,
        lateDays: totalLateDays,
      });
    } else {
      setLateDays(0);
      form.setFieldsValue({
        late_cost_settlement: form.getFieldValue("totalCostNumber"),
        latePenalty: 0,
        lateDays: 0,
      });
    }
    
    // Clear early return fields
    form.setFieldsValue({
      timeFinish: null,
      cost_settlement: null
    });
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
    console.log(contract, "contract");
    loadFile(
      "https://firebasestorage.googleapis.com/v0/b/my-project-fc361.appspot.com/o/Tat_toan_hop_dong.docx?alt=media&token=65cff6a6-25a2-4c17-97bc-bab89e9c8140",
      function (error, content) {
        if (error) {
          throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData({
          address: contract.address,
          fullName: contract?.bookBy,
          phone: contract.phone,
          bookingId: contract.bookingId,
          phoneNumber: user?.result.phoneNumber,
          nameStaff: user?.result.fullname,
          role: user?.result.role === "staff" ? "Nhân viên" : "Quản lý",
          id: contract._id,

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

  // Update the onSubmit function to include the late penalty information
  const onSubmit = async (values) => {
    try {
      const finalTimeFinish = values?.timeFinish 
        ? moment(values?.timeFinish?.format("YYYY-MM-DD"))._i 
        : values?.lateTimeFinish 
          ? moment(values?.lateTimeFinish?.format("YYYY-MM-DD"))._i 
          : undefined;
          
      const finalCostSettlement = values?.cost_settlement || values?.late_cost_settlement || values?.totalCostNumber;
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/final-contracts/create/${values._id}`,
        {
          images: values?.images || undefined,
          timeFinish: finalTimeFinish,
          cost_settlement: finalCostSettlement,
          note: values?.note || undefined,
          lateDays: values?.lateDays || 0,
          latePenalty: values?.latePenalty || 0,
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
        message.success("Create final contract successfully");
        setOpen(false);
        refetch();
      } else {
        message.error("Error submitting the form. Please try again later.");
        setOpen(false);
        refetch();
      }
    } catch (apiError) {
      message.error("Error submitting the form. Please try again later.");
      setOpen(false);
      refetch();
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
    setReturnType(null); // Reset return type when opening modal

    form.setFieldsValue({
      // timeFinish: moment(new Date()),
      ...booking,
    });
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

  const disabledDateEarly = (current) => {
    const arrayDayEnd = form
      .getFieldValue("timeBookingEnd")
      .split(" ")[0]
      .split("-");
    const dEnd = new Date(
      `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
    );
    dEnd.setDate(dEnd.getDate() + 1);

    const arrayDayStart = form
      .getFieldValue("timeBookingStart")
      .split(" ")[0]
      .split("-");
    const dStart = new Date(
      `${arrayDayStart[1]}-${arrayDayStart[0]}-${arrayDayStart[2]}`
    );

    return current < dStart || current > dEnd;
  };

  const disabledDateLate = (current) => {
    const arrayDayEnd = form
      .getFieldValue("timeBookingEnd")
      .split(" ")[0]
      .split("-");
    const dEnd = new Date(
      `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
    );

    const arrayDayStart = form
      .getFieldValue("timeBookingStart")
      .split(" ")[0]
      .split("-");
    const dStart = new Date(
      `${arrayDayStart[1]}-${arrayDayStart[0]}-${arrayDayStart[2]}`
    );

    return current < dEnd;
  };

  const { data, refetch } = useQuery({
    queryKey: [GET_LIST_CONTRACTS_KEY, accessToken, user?.result?.role],
    queryFn: async () =>
      await getListContracts(accessToken, user?.result?.role),
  });

  console.log(data?.result);

  const dataSource = data?.result.map((item, idx) => ({
    id: idx + 1,
    _id: item?._id,
    bookingId: item?.bookingId?._id,
    image: item?.images,
    createBy: item?.createBy?.fullname,
    bookBy: item?.bookingId?.bookBy?.fullname,
    email: item?.bookingId?.bookBy?.email,
    phone: item?.bookingId?.phone,
    address: item?.bookingId?.address,

    numberCar: item?.bookingId?.carId?.numberCar,
    model: item?.bookingId?.carId?.model?.name,
    cost: item?.bookingId?.carId?.cost,
    numberSeat: item?.bookingId?.carId?.numberSeat,
    yearManufacture: item?.bookingId?.carId?.yearManufacture,

    timeBookingStart: moment(item?.bookingId?.timeBookingStart).format(
      "DD-MM-YYYY HH:mm"
    ),
    timeBookingEnd: moment(item?.bookingId?.timeBookingEnd).format(
      "DD-MM-YYYY HH:mm"
    ),
    totalCost: formatCurrency(item?.bookingId?.totalCost),
    totalCostNumber: item?.bookingId?.totalCost,
    file: item?.file,
    status: item?.status,
  }));

  const columns = [
    { key: "id", title: "ID", dataIndex: "id", width: "4%" },
    {
      key: "image",
      title: "Ảnh hợp đồng",
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
            src={images[0] || "/placeholder.svg"}
          />
        </Image.PreviewGroup>
      ),
    },
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
      title: "Tổng Số Tiền",
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
    {
      key: "status",
      title: "Trạng Thái",
      dataIndex: "status",
      width: "8%",
      filters: [
        {
          text: "Đang thực hiện",
          value: "Đang thực hiện",
        },
        {
          text: "Đã tất toán",
          value: "Đã tất toán",
        },
      ],

      onFilter: (value, record) => record.status.includes(value),

      fixed: "right",
      render: (status) => (
        <>
          {status === "Đang thực hiện" ? (
            <>
              <p className="text-blue-500 flex justify-center">
                <MinusCircleOutlined
                  style={{
                    color: "blue",
                    fontSize: "12px",
                    marginRight: "5px",
                  }}
                />
                Đang Thực Hiện
              </p>
            </>
          ) : status === "Đã tất toán" ? (
            <>
              <p className="text-green-600 flex justify-center">
                <CheckCircleOutlined
                  style={{
                    color: "green",
                    fontSize: "12px",
                    marginRight: "5px",
                  }}
                />
                Đã Tất Toán
              </p>
            </>
          ) : (
            <>
              <p className="text-red-500 flex justify-center">
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
      width: "6%",
      render: (_, contract) => (
        <div className="flex gap-2">
          {contract.status === "Đã tất toán" ? (
            <Button
              type="primary"
              className=" border border-solid  "
              onClick={() => showModal(contract)}
              disabled
            >
              <PlusCircleOutlined style={{ fontSize: "14px" }} />
            </Button>
          ) : (
            <Tooltip
              placement="topLeft"
              title={"Tạo hợp đồng tất toán"}
              color={"rgb(74 222 128)"}
            >
              <Button
                type="primary"
                className=" border border-solid border-green-400 "
                onClick={() => showModal(contract)}
              >
                <PlusCircleOutlined style={{ fontSize: "14px" }} />
              </Button>
            </Tooltip>
          )}

          <Tooltip
            placement="top"
            title={"Tải file để tạo hợp đồng tất toán"}
            color="cyan"
          >
            <Button
              className=" border border-solid border-green-400 bg-cyan-400"
              onClick={() => generateDocument(contract)}
            >
              <DownloadOutlined style={{ fontSize: "14px" }} />
            </Button>
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
          Quản lý hợp đồng
        </Title>
      </div>
      <div className="mt-4 shadow-lg rounded-lg">
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
      </div>
      <Modal
        title="Tất toán hợp đồng"
        open={open}
        onOk={handleOk}
        footer={null}
        width={800}
        style={{ top: 20 }}
        onCancel={handleCancel}
      >
        <>
          <Form
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            layout="vertical"
            className="flex gap-4 mt-10 h-[80vh] overflow-y-scroll"
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

              <Form.Item label="Cost" hidden name="cost">
                <Input />
              </Form.Item>
              <Form.Item
                label="Tổng giá tiền thuê bằng số"
                hidden
                name="totalCostNumber"
              >
                <Input readOnly />
              </Form.Item>

              <h2>Trả xe trước thời hạn(nếu có)</h2>
              <Form.Item label="Thời gian kết thúc thuê" name="timeFinish">
                <DatePicker 
                  format="DD-MM-YYYY" 
                  disabledDate={disabledDateEarly} 
                  onChange={handleDays}
                  disabled={returnType === 'late'}
                />
              </Form.Item>
              <Form.Item
                label="Giá trị kết toán hợp đồng"
                name="cost_settlement"
              >
                <InputNumber
                  readOnly
                  formatter={(value) =>
                    `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                  style={{ width: "170px" }}
                />
              </Form.Item>

              <h2>Trả xe sau thời hạn(nếu có)</h2>
              <Form.Item label="Thời gian trả xe" name="lateTimeFinish">
                <DatePicker
                  format="DD-MM-YYYY"
                  disabledDate={disabledDateLate}
                  onChange={handleLateDays}
                  disabled={returnType === 'early'}
                />
              </Form.Item>
              <Form.Item label="Số ngày trả muộn" name="lateDays">
                <InputNumber readOnly style={{ width: "170px" }} />
              </Form.Item>
              <Form.Item label="Phí phạt trả muộn (10% mỗi ngày)" name="latePenalty">
                <InputNumber
                  readOnly
                  formatter={(value) =>
                    `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                  style={{ width: "170px" }}
                />
              </Form.Item>
              <Form.Item
                label="Giá trị kết toán hợp đồng"
                name="late_cost_settlement"
              >
                <InputNumber
                  readOnly
                  formatter={(value) =>
                    `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                  style={{ width: "170px" }}
                />
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
              <Form.Item
                label="Ảnh hợp đồng"
                name="images"
                rules={[
                  {
                    required: true,
                    message: "Hãy đăng ảnh tất toán hợp đồng lên!",
                  },
                ]}
              >
                <UploadContract />
              </Form.Item>
            </div>
          </Form>
        </>
      </Modal>
    </div>
  );
}

AdminManageContracts.Layout = AdminLayout;
