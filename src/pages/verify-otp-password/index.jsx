import { AuthLayout } from "@/layouts/AuthLayout";
import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Typography, message } from "antd";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import forgotPassword from "../../../public/forgotPassword.png";
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

const VerifyOTPPasswordPage = () => {
  const [form] = Form.useForm();
  const { query: searchParams } = useRouter();
  const router = useRouter();
  const email = searchParams?.email;

  const onSubmit = async (values) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/verify-otp/${values.otp}`,

        { email },

        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.message === "Invalid OTP") {
        message.error(response.data.message);
      } else {
        console.log("Data submitted successfully");
        router.push(`/reset-password?email=${email}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const { mutate } = useMutation(onSubmit);
  return (
    <div className="py-[30px] px-[20px] h-screen">
      <div className="flex flex-col justify-center items-center h-full ">
        <Image src={forgotPassword} alt="logo" width={150} height={90} />
        <Title>Quên mật khẩu</Title>
        <div>FRT vừa gửi mã OTP vào email của bạn.</div>
        <Title level={5} className="text-gray-500">
          Vui lòng nhập mã gồm 6 số vào ô bên dưới để xác minh.
        </Title>
        <div>
          <Form
            layout="vertical"
            name="basic"
            style={{
              maxWidth: 600,
            }}
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            autoComplete="off"
            className="mt-5"
          >
            <Form.Item
              name="otp"
              rules={[
                {
                  required: true,
                  message: "Please input your OTP!",
                },
              ]}
            >
              <StyleInput placeholder="Nhập mã OTP từ email" size="large" />
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

export default VerifyOTPPasswordPage;

VerifyOTPPasswordPage.Layout = AuthLayout;
