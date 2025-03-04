import {
  getAdminDashboard,
  getTotalRevenueByMonth,
} from "@/apis/admin-dashboard.api";
import {
  GET_ADMIN_DASHBOARD,
  GET_TOTAL_REVENUE_BY_MONTH,
} from "@/constants/react-query-key.constant";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { formatCurrency } from "@/utils/number.utils";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { random, range } from "lodash-es";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const options = {
  bezierCurve: true,
  tension: 0.4,
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Thống kê doanh thu",
    },
  },
};

export default function AdminDashboard() {
  const [accessToken] = useLocalStorage("access_token");

  const { data } = useQuery({
    queryFn: () => getAdminDashboard({ accessToken }),
    queryKey: GET_ADMIN_DASHBOARD,
  });

  const { data: revenue } = useQuery({
    queryFn: () => getTotalRevenueByMonth({ accessToken }),
    queryKey: GET_TOTAL_REVENUE_BY_MONTH,
  });

  console.log(revenue);
  console.log(
    range(1, 13).map((index) => {
      const found = revenue?.find((item) => Number(item?.month) === index);
      console.log(found);

      return found?.totalRevenue ?? 0;
    })
  );

  const chartData = {
    labels: range(1, 13).map((item) => `Tháng ${item}`),
    datasets: [
      {
        data: range(1, 13).map((index) => {
          const found = revenue?.find((item) => Number(item?.month) === index);
          console.log(found);

          return found?.totalRevenue ?? 0;
          // return random(3000);
        }),
        fill: true,
        borderColor: "rgb(142, 228, 157)",
        label: "Doanh thu",
      },
    ],
  };

  return (
    <div>
      <div className="mt-10 grid grid-cols-4 gap-4">
        <div className="shadow-lg rounded-md p-6 flex flex-col justify-center items-center bg-white">
          <div className="text-3xl font-bold mb-1">
            {data?.totalBookingByMonth}
          </div>
          <span>lượt thuê xe</span>
        </div>
        <div className="shadow-lg rounded-md p-6 flex flex-col justify-center items-center bg-white">
          <div className="text-3xl font-bold mb-1">{data?.totalCars}</div>
          <span>xe</span>
        </div>
        <div className="shadow-lg rounded-md p-6 flex flex-col justify-center items-center bg-white">
          <div className="text-3xl font-bold mb-1">{data?.totalUsers}</div>
          <span>người dùng</span>
        </div>
        <div className="shadow-lg rounded-md p-6 flex flex-col justify-center items-center bg-white">
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(data?.totalRevenue)}
          </div>
          <span>doanh thu</span>
        </div>
      </div>

      <div className="h-96 mt-10 flex justify-center">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}

AdminDashboard.Layout = AdminLayout;
