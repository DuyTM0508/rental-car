"use client";

import { Button, Col, Layout, Row, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import bgImage from "../../public/bgImage.jpg";
import { useRouter } from "next/router";

const { Title } = Typography;

export const AuthLayout = ({ children }) => {
  const { pathname } = useRouter();

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Row className="h-full">
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          xl={12}
          className="flex items-center justify-center p-8"
        >
          <div className="w-full max-w-md">{children}</div>
        </Col>
        <Col xs={0} sm={0} md={12} lg={12} xl={12} className="relative">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={bgImage || "/placeholder.svg"}
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              priority
            />
            <div className="absolute inset-0 bg-green-600/30 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/20 to-green-900/70" />
          </div>
          <div className="absolute inset-3 flex flex-col justify-between px-12 py-20 text-white">
            <div>
              <Title level={1} className="text-white text-5xl font-bold mb-6">
                CRT
              </Title>
              <Title level={2} className="text-white font-normal">
                Hành trình theo cách của bạn
              </Title>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <Title level={5} className="text-white mb-4">
                {pathname === "/register"
                  ? "Bạn đã có tài khoản?"
                  : "Bạn chưa có tài khoản?"}
              </Title>
              <Link href={pathname === "/register" ? "/login" : "/register"}>
                <Button
                  type="primary"
                  size="large"
                  className="w-full bg-white text-green-600 border-white hover:bg-green-50 hover:text-green-700 hover:border-green-50"
                >
                  <span className="font-semibold">
                    {pathname === "/register" ? "Đăng nhập" : "Đăng ký"}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Layout>
  );
};
