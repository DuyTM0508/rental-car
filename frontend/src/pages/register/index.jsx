import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import logo from "../../../public/logo2.png";

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

const LogoContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    width: 40%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(34, 197, 94, 0.5),
      transparent
    );
    border-radius: 2px;
  }
`;

const RegisterPage = () => {
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
      <div className="flex flex-col justify-center items-center h-full">
        <LogoContainer>
          <div className="relative group">
            <div className="absolute -inset-4 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:shadow-md transition-all duration-300"></div>
            <div className="relative">
              <Image
                src={logo || "/placeholder.svg"}
                alt="FRT Logo"
                width={150}
                height={90}
                priority
                className="transition-all duration-300 group-hover:scale-105 rounded-xl"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(34, 197, 94, 0.15))",
                }}
              />
            </div>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
          </div>
          <div className="text-green-500 font-medium text-sm mt-2 opacity-80">
            Đăng ký tài khoản mới
          </div>
        </LogoContainer>

        <Title>Đăng ký thông tin</Title>

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
          >
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
              <StyleInput placeholder="Họ và tên" size="medium" />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              rules={[{ validator: validatePhoneNumber }]}
            >
              <StyleInput placeholder="Số Điện Thoại" size="medium" />
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
              <StyleInput placeholder="Địa chỉ" size="medium" />
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

            <Form.Item>
              <ButtonSummit type="primary" htmlType="submit">
                Đăng ký
              </ButtonSummit>
            </Form.Item>
          </Form>
          <div className="flex justify-center mt-4">
            <Title level={5} className="m-0">
              Bạn đã có tài khoản?{" "}
              <Link href="/login">
                <Button
                  type="text"
                  className="font-bold text-base text-green-500 p-0"
                >
                  Đăng Nhập
                </Button>
              </Link>
            </Title>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

RegisterPage.Layout = AuthLayout;
