import { Button, Col, Layout, Row, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import bgImage from "../../public/bgImage.jpg";
import { useRouter } from "next/router";
const { Title } = Typography;

export const AuthLayout = ({ children }) => {
  const { pathname } = useRouter();

  return (
    <Layout className="max-w-6xl mx-auto h-screen bg-white">
      <Row>
        <Col className="gutter-row" xs={0} sm={0} md={12} lg={12} xl={12}>
          <div className="relative h-screen">
            <div className="absolute z-40 inset-0 mx-[20px] my-[30px] bg-green-500 bg-opacity-50 rounded-[10px]"></div>
            <div className="absolute inset-0 mx-[20px] my-[30px] rounded-[10px]">
              <Image
                className="rounded-[10px]"
                src={bgImage}
                alt="My Image"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
              />
            </div>
            <div className="absolute z-40 inset-0  mx-[20px] my-[30px]  rounded-[10px]">
              <Title level={1} className="text-white mx-6 my-20 w-3/4">
                CRT - Hành trình theo cách của bạn
              </Title>
            </div>
            <div className="absolute z-50 inset-x-0 bottom-0 mx-[20px] my-[30px]   left-0    bg-green-900 bg-opacity-50 rounded-b-lg">
              <div className="flex justify-center items-center h-20">
                <Title level={5} className="text-white mb-6">
                  {pathname === "/register"
                    ? "Bạn đã có tài khoản?"
                    : "Bạn chưa có tài khoản?"}
                  <Button type="text" className=" font-bold  mr-5 ml-5">
                    {pathname === "/register" ? (
                      <Link href="/login">
                        <div className="text-white"> Đăng nhập</div>
                      </Link>
                    ) : (
                      <Link href="/register">
                        <div className="text-white"> Đăng ký</div>
                      </Link>
                    )}
                  </Button>
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={12} xl={12}>
          <div>{children}</div>
        </Col>
      </Row>
    </Layout>
  );
};
