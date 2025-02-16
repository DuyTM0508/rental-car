import { Button, Form, Input, Typography } from "antd";
import Image from "next/image";
import forgotPassword from "../../../public/forgotPassword.png";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AuthLayout } from "@/layouts/AuthLayout";

const { Title } = Typography;

const StyleInput = styled(Input)`
  border-color: #949494;
  height: 50px;
  width: 400px;
`;

const ButtonSummit = styled(Button)`
  width: 400px;
  height: 50px;
  font-size: 18px;
  font-weight: 700;
  padding: 30px auto;
`;

const RecoverPasswordPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  const onSubmit = async (values) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/generate-otp`,

        values
      );

      if (response.status === 200) {
        const response1 = await axios.post(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/get-user-by-email`,
          values
        );

        let text = `Your Password Recovery OTP is ${response.data.code}. Verify and recover your password.`;
        await axios.post(
          `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/register-mail`,

          {
            ...values,
            name: response1.data.result.fullname,
            text,
            subject: "Password Recovery OTP",
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        router.push(`/verify-otp-password?email=${values.email}`);
      } else {
        console.error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const { mutate } = useMutation(onSubmit);
  return (
    <div className="py-[30px] px-[20px] h-screen">
      <div className="flex flex-col justify-center items-center h-full ">
        <Image
          src={forgotPassword}
          alt="logo"
          width={150}
          height={90}
          // loader={loaderProp}
        />
        <Title>Quên mật khẩu</Title>
        <Title level={5}>Nhập email để lấy lại mật khẩu</Title>

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
            className="mt-5"
          >
            <Form.Item
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input your E-mail!",
                },
              ]}
            >
              <StyleInput placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item>
              <ButtonSummit type="primary" htmlType="submit">
                Tiếp tục
              </ButtonSummit>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RecoverPasswordPage;

RecoverPasswordPage.Layout = AuthLayout;
