import FooterComponent from "@/components/FooterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { useUserState } from "@/recoils/user.state";
import { Layout } from "antd";
import { useRouter } from "next/router";
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
