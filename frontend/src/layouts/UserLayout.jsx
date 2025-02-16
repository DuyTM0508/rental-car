import { UserFilledIcon } from "@/icons";
import styled from "@emotion/styled";
import { Divider, Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import HeaderComponent from "@/components/HeaderComponent";
import FooterComponent from "@/components/FooterComponent";
import { useRouter } from "next/router";
import { useUserState } from "@/recoils/user.state";
const { Content } = Layout;

export function UserWebLayout({ children }) {
  const [user] = useUserState();
  const { pathname, push } = useRouter();

  const role = user?.result?.role;

  if (role === "admin" && !(pathname.includes("admin") || pathname.includes("_error"))) {
    push("/admin/dashboard");
  }

  return (
    <Layout className="bg-white min-h-screen">
      <HeaderComponent />
      <Content className="bg-white py-2">{children}</Content>
      <FooterComponent />
    </Layout>
  );
}
