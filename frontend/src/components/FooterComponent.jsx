import { FacebookFilled, YoutubeFilled } from "@ant-design/icons";
import { Layout } from "antd";
import Image from "next/image";

const { Footer } = Layout;

export default function FooterComponent() {
  return (
    <Footer className="sticky top-0 z-10 w-full mt-8">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="relative w-20 h-12">
              <Image src="/logo.png" layout="fill" />
            </div>
            {/* <div className="text-2xl font-semibold tracking-wider text-green-500">CRT</div> */}
          </div>

          <div className="mt-4 text-lg font-bold text-gray-700 mb-2">
            Liên hệ với chúng tôi
          </div>
          <div className="flex gap-3">
            <span className="w-28">Số điện thoại:</span>
            <a href="tel:038658742" className="text-gray-900 underline">
              082-858-2003
            </a>
          </div>
          <div className="flex gap-3 mt-2">
            <span className="w-28">Email:</span>
            <a
              href="mailto:crtteam@gmail.com"
              className="text-gray-900 underline"
            >
              duytmhe176217@fpt.edu.vn
            </a>
          </div>

          <div className="mt-4 flex gap-3">
            <FacebookFilled className="text-2xl" />
            <YoutubeFilled className="text-2xl" />
          </div>

          <div className="mt-4">
            <div className="font-semibold text-lg">Địa chỉ:</div>
            <div>
              Km29 Trường đại học FPT, Hoà Lạc, Thạch Thất, Hà Nội, Việt Nam
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-gray-600">
          <div className="text-lg font-semibold my-2 text-gray-700">
            Chính sách
          </div>
          <div>Chính sách thuê xe</div>
          <div>Quy chế hoạt động</div>
          <div>Bảo mật thông tin</div>
          <div>Giải quyết sự cố</div>
        </div>

        <div className="flex flex-col gap-3 text-gray-600">
          <div className="text-lg font-semibold my-2 text-gray-700">
            Tìm hiểu thêm
          </div>
          <div>Hướng dẫn chung</div>
          <div>Hướng dẫn thuê xe</div>
          <div>Hướng dẫn thanh toán</div>
          <div>Về chúng tôi</div>
        </div>

        <div className="flex flex-col gap-3 text-gray-600">
          <div className="text-lg font-semibold my-2 text-gray-700">
            Đối tác
          </div>
          <div>Trở thành đối tác</div>
        </div>
      </div>
    </Footer>
  );
}
