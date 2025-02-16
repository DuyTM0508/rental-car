import OAuthGoogle from "@/components/OAuthGoogle.jsx";
import { AuthLayout } from "@/layouts/AuthLayout";
import styled from "@emotion/styled";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import logo from "../../../public/logo.png";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state.js";
import { useDriverState } from "@/recoils/driver.state.js";
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

const LoginPage = () => {
  const loaderProp = ({ src }) => {
    return src;
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
  const [form] = Form.useForm();
  const router = useRouter();
  const [user, setUser] = useUserState();
  const [driver, setDriver] = useDriverState();
  const [profile, setProfile, clearProfile] = useLocalStorage("profile", "");
  const [getProfile] = useLocalStorage();
  const [accessToken, setAccessToken, clearAccessToken] = useLocalStorage(
    "access_token",
    ""
  );
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
        console.log(response.data);
        setUser({ ...response.data });
        setAccessToken(response.data.access_token);
        console.log(response.data.result.role);
        if (response.data.role === "user") {
          router.push("/");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        toast.error(error.response.data.errors[0].msg, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      toast.error(error.response.data.errors[0].msg, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const { mutate } = useMutation(onSubmit);
  return (
    <div className="pb-5 px-[20px] h-screen">
      <div className="flex flex-col justify-center items-center h-full ">
        <Image
          src={logo}
          alt="logo"
          width={150}
          height={90}
          loader={loaderProp}
          unoptimized={true}
        />
        <Title>Đăng nhập</Title>
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
            initialValues={{}}
            autoComplete="off"
            className="mt-5"
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
              <StyleInput placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                // { required: true, message: "Hãy nhập mật khẩu để đăng nhập!" },
                // {
                //   type: "string",
                //   message: "Mật khẩu phải là một chuỗi!",
                // },
                // {
                //   min: 6,
                //   max: 40,
                //   message: "Độ dài mật khẩu từ 6 đến 40 ký tự!",
                // },
                { validator: validateStrongPassword },
              ]}
              // style={{ width: "70%" }}
              // hasFeedback
            >
              <StyleInputPassword
                type="password"
                placeholder="Mật khẩu"
                size="large"
                // style={{ width: "100%" }}
              />
            </Form.Item>
            <div className="flex justify-end">
              <Button
                type="text"
                className="  text-green-400 font-bold text-base  mb-3"
              >
                <Link href="/recover-password"> Quên mật khẩu?</Link>
              </Button>
            </div>

            <Form.Item>
              <ButtonSummit type="primary" htmlType="submit">
                Đăng nhập
              </ButtonSummit>
            </Form.Item>
          </Form>
          <div className=" 2xl:hidden xl:hidden lg:hidden md:hidden  justify-end  ">
            <div className="flex justify-end">
              <div level={5}>
                Bạn chưa có tài khoản?{" "}
                <Button
                  type="text"
                  className="font-bold text-base text-green-500"
                >
                  <Link href="/register"> Đăng ký</Link>
                </Button>
              </div>
            </div>
          </div>
          <Title level={5} className="flex justify-center">
            Or
          </Title>
          <OAuthGoogle />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

LoginPage.Layout = AuthLayout;
