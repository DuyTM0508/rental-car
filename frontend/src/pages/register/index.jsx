import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import logo from "../../../public/logo.png";

import useLocalStorage from "@/hooks/useLocalStorage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useUserState } from "@/recoils/user.state.js";

const { Title } = Typography;

const StyleInput = styled(Input)`
  border-color: #949494;
  height: 50px;
  width: 400px;
`;
const StyleInputPassword = styled(Input.Password)`
  width: 400px;
  height: 50px;
  border-color: #949494;
`;

const ButtonSummit = styled(Button)`
  width: 400px;
  height: 50px;
  font-size: 18px;
  font-weight: 700;
  padding: 30px auto;
`;

const RegisterPage = () => {
  const loaderProp = ({ src }) => {
    return src;
  };

  const validatePhoneNumber = (_, value) => {
    // Simple regex pattern for a basic phone number validation
    const phoneNumberRegex = /^(?:\d{10}|\d{11})$/;

    if (!value) {
      return Promise.reject("Hãy nhập số điện thoại!");
    }

    if (!phoneNumberRegex.test(value)) {
      return Promise.reject("Không phải số điện thoại!");
    }

    return Promise.resolve();
  };

  const validateStrongPassword = (_, value) => {
    if (!value) {
      return Promise.reject("Hãy nhập mật khẩu!");
    }
    if (value.length < 6 || value.length > 40) {
      return Promise.reject("Độ dài mật khẩu từ 6 đến 40 ký tự!");
    }

    if (
      !/[a-z]/.test(value) ||
      !/[A-Z]/.test(value) ||
      !/\d/.test(value) ||
      !/[\W_]/.test(value)
    ) {
      return Promise.reject(
        `Phải có ít nhật một ký tự đặc biệt(@!>...), in hoa,
         thường, số!`
      );
    }

    return Promise.resolve();
  };

  const validateFullname = (_, value) => {
    // Simple regex pattern for checking if fullname contains numbers
    const numberRegex = /\d/;

    if (!value) {
      return Promise.reject("Hãy nhập họ và tên!");
    }

    if (numberRegex.test(value)) {
      return Promise.reject("Họ và tên không được nhập số!");
    }

    return Promise.resolve();
  };

  const [form] = Form.useForm();
  const router = useRouter();
  const [user, setUser] = useUserState();

  const [accessToken, setAccessToken, clearAccessToken] = useLocalStorage(
    "access_token",
    ""
  );
  const onSubmit = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/register`,

        values,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        setUser({ ...response.data });

        setAccessToken(response.data.access_token);
        if (response.data.result.role === "user") {
          router.push("/");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        console.log(error.response.data.errors[0].msg);
      }
    } catch (error) {
      toast.error(error.response.data.errors[0].msg, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const { mutate } = useMutation(onSubmit);
  return (
    <div className="py-[30px] px-[20px] h-screen">
      <div className="flex flex-col justify-center items-center h-full ">
        <Image
          src={logo}
          alt="logo"
          width={150}
          height={90}
          loader={loaderProp}
        />
        <Title>Đăng ký thông tin</Title>
        {/* <Title level={5}>Đăng ký thông tin</Title> */}

        <div>
          <Form
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            layout="vertical"
            name="basic"
            style={{
              maxWidth: 600,
            }}
            autoComplete="off"
            // className="mt-5"
          >
            {/* <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Hãy nhập tên hiẻn thị!",
                  whitespace: true,
                },
                {
                    min: 6,
                    max: 40,
                    message: "Độ dài tên hiển thị từ 6 đến 40 ký tự!",
                  },
              ]}
            >
              <StyleInput
                placeholder="Username"
                size="medium"
                // style={{ border: "2px solid red" }}
              />
            </Form.Item> */}

            <Form.Item
              name="email"
              rules={[
                {
                  type: "email",
                  message: "Không phải E-mail!",
                },
                {
                  required: true,
                  message: "Hãy nhập E-mail để đăng ký tài khoản!",
                },
              ]}
            >
              <StyleInput placeholder="Email" size="medium" />
            </Form.Item>
            <Form.Item
              name="fullname"
              rules={[{ validator: validateFullname }]}
            >
              <StyleInput
                placeholder="Họ và tên"
                size="medium"
                // style={{ border: "2px solid red" }}
              />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              rules={[{ validator: validatePhoneNumber }]}
            >
              <StyleInput
                placeholder="Số Điện Thoại"
                size="medium"
                // style={{ border: "2px solid red" }}
              />
            </Form.Item>
            <Form.Item
              name="address"
              rules={[
                {
                  required: true,
                  message: "Địa chỉ không được để trống!",
                  whitespace: true,
                },
              ]}
            >
              <StyleInput
                placeholder="Địa chỉ"
                size="medium"
                // style={{ border: "2px solid red" }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ validator: validateStrongPassword }]}
            >
              <StyleInputPassword
                type="password"
                placeholder="Mật khẩu"
                size="medium"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Hãy xác thực mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu bạn nhập vào không giống!")
                    );
                  },
                }),
              ]}
            >
              <StyleInputPassword
                type="password"
                placeholder="Xác thực mật khẩu"
                size="medium"
              />
            </Form.Item>

            <Form.Item
            //   wrapperCol={{
            //     offset: 8,
            //     span: 16,
            //   }}
            >
              <ButtonSummit type="primary" htmlType="submit">
                Đăng ký
              </ButtonSummit>
            </Form.Item>
          </Form>
          <div className=" 2xl:hidden xl:hidden lg:hidden md:hidden  justify-end  ">
            <Title level={5}>
              Bạn đã có tài khoản?{" "}
              <Button
                type="text"
                className="font-bold text-base text-green-500"
              >
                Đăng Nhập
              </Button>
            </Title>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

RegisterPage.Layout = AuthLayout;
