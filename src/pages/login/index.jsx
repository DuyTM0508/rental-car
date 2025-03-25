import OAuthGoogle from "@/components/OAuthGoogle.jsx";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useDriverState } from "@/recoils/driver.state.js";
import { useUserState } from "@/recoils/user.state.js";
import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import logo from "../../../public/logo2.png";

const { Title, Text } = Typography;

const StyledForm = styled(Form)`
  width: 100%;
  max-width: 400px;
`;

const StyledInput = styled(Input)`
  height: 50px;
  border-radius: 8px;
  border-color: #e2e8f0;
`;

const StyledInputPassword = styled(Input.Password)`
  height: 50px;
  border-radius: 8px;
  border-color: #e2e8f0;
`;

const StyledButton = styled(Button)`
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
`;

const LogoContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;

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

const LoginPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [user, setUser] = useUserState();
  const [, setDriver] = useDriverState();
  const [, setProfile] = useLocalStorage("profile", "");
  const [, setAccessToken] = useLocalStorage("access_token", "");

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
        "Phải có ít nhất một ký tự đặc biệt(@!>...), in hoa, thường, số!"
      );
    }
    return Promise.resolve();
  };

  const onSubmit = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/login`,
        values,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setUser({ ...response.data });
        setAccessToken(response.data.access_token);
        if (response.data.role === "user") {
          router.push("/");
        } else {
          router.push("/admin/dashboard");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.errors[0]?.msg || "Login failed", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const { mutate, isLoading } = useMutation(onSubmit);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <LogoContainer>
            <div className="relative group">
              <div className="absolute -inset-4 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:shadow-md transition-all duration-300"></div>
              <div className="relative">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt="FRT Logo"
                  width={140}
                  height={84}
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
              Thuê xe an toàn & tiện lợi
            </div>
          </LogoContainer>
          <Title level={2} className="text-center m-0">
            Đăng nhập
          </Title>
        </div>
        <StyledForm
          form={form}
          onFinish={(values) => mutate(values)}
          layout="vertical"
          name="login"
          initialValues={{}}
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
                message: "Hãy nhập E-mail để đăng nhập!",
              },
            ]}
          >
            <StyledInput placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validateStrongPassword }]}
          >
            <StyledInputPassword placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <div className="flex justify-end mb-4">
            <Link
              href="/recover-password"
              className="text-green-500 hover:text-green-600"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item>
            <StyledButton
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
            >
              Đăng nhập
            </StyledButton>
          </Form.Item>
        </StyledForm>

        <div className="mt-6">
          <Text className="text-center block mb-4">Hoặc</Text>
          <OAuthGoogle />
        </div>

        <div className="mt-6 text-center">
          <Text>
            Bạn chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Đăng ký
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

LoginPage.Layout = AuthLayout;
