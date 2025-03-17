import {
  Car,
  Users,
  Clock,
  Award,
  MapPin,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <section className="py-12 lg:py-24 bg-gradient-to-b from-blue-50 to-white font-poppins">
      <div className="max-w-6xl mx-auto lg:py-6 md:px-6">
        <div className="flex flex-wrap">
          <div className="w-full px-4 mb-10 lg:w-1/2 lg:mb-0">
            <div className="lg:max-w-md">
              <div className="px-4 pl-4 mb-6 border-l-4 border-blue-600">
                <span className="text-sm text-blue-600 uppercase font-semibold">
                  Về Chúng Tôi
                </span>
                <h1 className="mt-2 text-3xl font-black text-gray-800 md:text-5xl">
                  Hành Trình Cùng Bạn, Mọi Nẻo Đường
                </h1>
              </div>
              <p className="px-4 mb-8 text-base leading-7 text-gray-600">
                Chào mừng bạn đến với dịch vụ của chúng tôi, nơi mang đến những
                trải nghiệm thuê xe nhanh chóng, tiện lợi và đáng tin cậy! Chúng
                tôi hiểu rằng mỗi chuyến đi đều là một hành trình đáng nhớ, và
                nhiệm vụ của chúng tôi là giúp bạn tận hưởng nó một cách trọn
                vẹn nhất.
              </p>

              <div className="px-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Tại Sao Chọn Chúng Tôi?
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600 mt-1">
                      <Car className="w-5 h-5" />
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold">Đa Dạng Dòng Xe</span> –
                      Từ xe tiết kiệm nhiên liệu đến dòng xe cao cấp, chúng tôi
                      luôn có lựa chọn phù hợp cho mọi nhu cầu của bạn.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600 mt-1">
                      <Clock className="w-5 h-5" />
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold">Dịch Vụ Linh Hoạt</span> –
                      Thuê xe dễ dàng, đặt xe nhanh chóng, giao nhận tận nơi
                      theo yêu cầu.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600 mt-1">
                      <Award className="w-5 h-5" />
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold">Giá Cả Cạnh Tranh</span> –
                      Chính sách giá minh bạch, không phí ẩn, đảm bảo mức giá
                      tốt nhất cho khách hàng.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600 mt-1">
                      <Users className="w-5 h-5" />
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold">
                        Đội Ngũ Chuyên Nghiệp
                      </span>{" "}
                      – Đội ngũ tư vấn tận tâm, sẵn sàng hỗ trợ 24/7 để giúp bạn
                      có trải nghiệm tốt nhất.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="px-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Sứ Mệnh Của Chúng Tôi
                </h2>
                <p className="text-gray-600 leading-7">
                  Chúng tôi không chỉ cho thuê xe – chúng tôi đồng hành cùng bạn
                  trên mọi hành trình. Dù bạn đang có chuyến công tác, du lịch
                  cùng gia đình hay đơn giản chỉ cần một phương tiện di chuyển
                  thoải mái, chúng tôi luôn sẵn sàng phục vụ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 px-4">
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <span className="text-blue-600">
                    <Car className="w-10 h-10" />
                  </span>
                  <p className="mt-4 mb-2 text-3xl font-bold text-gray-800">
                    50+
                  </p>
                  <h2 className="text-sm text-gray-700">Dòng Xe Đa Dạng</h2>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <span className="text-blue-600">
                    <Users className="w-10 h-10" />
                  </span>
                  <p className="mt-4 mb-2 text-3xl font-bold text-gray-800">
                    3,590+
                  </p>
                  <h2 className="text-sm text-gray-700">Khách Hàng Hài Lòng</h2>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <span className="text-blue-600">
                    <Award className="w-10 h-10" />
                  </span>
                  <p className="mt-4 mb-2 text-3xl font-bold text-gray-800">
                    10+
                  </p>
                  <h2 className="text-sm text-gray-700">Năm Kinh Nghiệm</h2>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <span className="text-blue-600">
                    <MapPin className="w-10 h-10" />
                  </span>
                  <p className="mt-4 mb-2 text-3xl font-bold text-gray-800">
                    15+
                  </p>
                  <h2 className="text-sm text-gray-700">Chi Nhánh</h2>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full px-4 mb-10 lg:w-1/2 lg:mb-0">
            <div className="relative">
              <img
                src="https://i.postimg.cc/9MW8G96J/pexels-the-coach-space-2977565.jpg"
                alt="Đội ngũ chuyên nghiệp"
                className="object-cover w-full h-full rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <h3 className="text-2xl font-bold text-white mb-2">
                  🚀 Hãy để chúng tôi giúp bạn bắt đầu chuyến đi tuyệt vời ngay
                  hôm nay!
                </h3>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-white">
                    <Globe className="w-5 h-5 mr-3" />
                    <span>
                      Website:{" "}
                      <Link href="#" className="underline hover:text-blue-300">
                        www.example.com
                      </Link>
                    </span>
                  </div>
                  <div className="flex items-center text-white">
                    <Phone className="w-5 h-5 mr-3" />
                    <span>
                      Hotline:{" "}
                      <Link
                        href="tel:+84123456789"
                        className="underline hover:text-blue-300"
                      >
                        082-858-2003
                      </Link>
                    </span>
                  </div>
                  <div className="flex items-center text-white">
                    <Mail className="w-5 h-5 mr-3" />
                    <span>
                      Email:{" "}
                      <Link href="#" className="underline hover:text-blue-300">
                        duytmhe176217@fpt.edu.vn
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-blue-600 rounded-lg shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">Đặt Xe Ngay Hôm Nay</h3>
              <p className="mb-4">
                Chỉ với vài bước đơn giản, bạn đã có thể thuê xe và bắt đầu hành
                trình của mình.
              </p>
              <Link
                href="/cars"
                className="inline-block px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Đặt Xe Ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
