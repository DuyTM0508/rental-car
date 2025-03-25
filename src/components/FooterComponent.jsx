import { FacebookFilled, YoutubeFilled } from "@ant-design/icons";
import { Layout } from "antd";
import Image from "next/image";
import Link from "next/link";

const { Footer } = Layout;

export default function FooterComponent() {
  return (
    <Footer className="sticky top-0 z-10 w-full mt-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link href="/">
            <div className="flex items-center gap-2 group cursor-pointer w-fit">
              <div className="relative w-20 h-12 overflow-hidden rounded-sm transition-all duration-300 group-hover:shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-sm"></div>
                <Image
                  src="/logo2.png"
                  alt="FRT Logo"
                  layout="fill"
                  className="object-contain"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(34, 197, 94, 0.15))",
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-wider text-green-500 transition-colors duration-300 group-hover:text-green-600">
                  FRT
                </span>
                <div className="h-0.5 w-0 bg-gradient-to-r from-green-300 to-green-500 group-hover:w-full transition-all duration-300 ease-out"></div>
              </div>
            </div>
          </Link>

          <div className="mt-4 text-lg font-bold text-gray-700 mb-2">
            Liên hệ với chúng tôi
          </div>
          <div className="flex gap-3">
            <span className="w-28">Số điện thoại:</span>
            <a
              href="tel:038658742"
              className="text-gray-900 hover:text-green-600 transition-colors duration-200 underline"
            >
              082-858-2003
            </a>
          </div>
          <div className="flex gap-3 mt-2">
            <span className="w-28">Email:</span>
            <a
              href="mailto:crtteam@gmail.com"
              className="text-gray-900 hover:text-green-600 transition-colors duration-200 underline"
            >
              duytmhe176217@fpt.edu.vn
            </a>
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <FacebookFilled className="text-2xl" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-red-600 transition-colors duration-200"
            >
              <YoutubeFilled className="text-2xl" />
            </a>
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
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Chính sách thuê xe
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Quy chế hoạt động
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Bảo mật thông tin
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Giải quyết sự cố
          </div>
        </div>

        <div className="flex flex-col gap-3 text-gray-600">
          <div className="text-lg font-semibold my-2 text-gray-700">
            Tìm hiểu thêm
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Hướng dẫn chung
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Hướng dẫn thuê xe
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Hướng dẫn thanh toán
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Về chúng tôi
          </div>
        </div>

        <div className="flex flex-col gap-3 text-gray-600">
          <div className="text-lg font-semibold my-2 text-gray-700">
            Đối tác
          </div>
          <div className="hover:text-green-600 cursor-pointer transition-colors duration-200">
            Trở thành đối tác
          </div>
        </div>
      </div>
    </Footer>
  );
}
