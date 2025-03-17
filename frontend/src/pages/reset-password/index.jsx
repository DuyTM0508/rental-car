import { AuthLayout } from "@/layouts/AuthLayout";
import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import forgotPassword from "../../../public/forgotPassword.png";

const { Title } = Typography;

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

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const { query: searchParams } = useRouter();

  console.log(searchParams);

  const router = useRouter();
  const email = searchParams?.email;
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

  const onSubmit = async (values) => {
    try {
      const { password } = values;
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/reset-password`,

        { email: email.toString(), password: password.toString() },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        console.log(response.data);
        router.push("/login");
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
          src={forgotPassword}
          alt="logo"
          width={150}
          height={90}
          // loader={loaderProp}
        />
        <Title>Đặt lại mật khẩu mới</Title>
        <Title level={5} className="text-gray-400">
          Nhập lại mật khẩu mới để đăng nhập
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
              name="password"
              rules={[{ validator: validateStrongPassword }]}
            >
              <StyleInputPassword
                type="password"
                placeholder="Mật khẩu"
                size="large"
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
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <ButtonSummit type="primary" htmlType="submit">
                Cập nhập
              </ButtonSummit>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

ResetPasswordPage.Layout = AuthLayout;
