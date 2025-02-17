import { CarCard } from "@/components/CarCard";
import React from "react";
import { FilterFilledIcon } from "@/icons";

import {
  Button,
  Input,
  Space,
  Select,
  Spin,
  Slider,
  Modal,
  Radio,
  Divider,
} from "antd";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getListCars } from "@/apis/user-cars.api";
import { getBrands } from "@/apis/brands.api";
import { GET_BRANDS_KEY } from "@/constants/react-query-key.constant";
import InfiniteScroll from "react-infinite-scroll-component";
export default function ListCarsPage() {
  const { query, pathname } = useRouter();
  const router = useRouter();
  const {
    brand,
    numberSeat,
    transmissions,
    ["cost[gte]"]: costGte,
    ["cost[lte]"]: costLte,
    sort,
  } = query;

  const newQuery = { ...query };

  const handleQueryChange = (key, selected) => {
    if (selected !== "all") {
      newQuery[key] = selected;
    } else {
      delete newQuery[key];
    }
    router.push({ pathname, query: newQuery });
  };

  const handleCostChange = (values) => {
    const [minCost, maxCost] = values;
    if (minCost === 0 && maxCost === 3000000) {
      delete newQuery["cost[gte]"];
      delete newQuery["cost[lte]"];
    } else {
      newQuery["cost[gte]"] = minCost;
      newQuery["cost[lte]"] = maxCost;
    }

    router.push({ pathname, query: newQuery });
  };
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const showSortModal = () => {
    setSortModalVisible(true);
  };

  const handleSortOk = () => {
    setSortModalVisible(false);
  };

  const handleSortCancel = () => {
    setSortModalVisible(false);
  };

  const fetchCars = async ({ pageParam = 1 }) => {
    try {
      // Use the getCars function here
      const response = await getListCars({
        brand,
        numberSeat,
        transmissions,
        "cost[gte]": costGte,
        "cost[lte]": costLte,
        page: pageParam,
        sort,
      });

      return response;
    } catch (error) {
      console.log(error);
    }

    // Remove keys with "all" values
    Object.keys(newQuery).forEach(
      (key) => newQuery[key] === "all" && delete newQuery[key]
    );
  };
  const { data: brandsData } = useQuery({
    queryKey: [GET_BRANDS_KEY],
    queryFn: getBrands,
  });

  const { isLoading, data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["getListCars", newQuery],
    queryFn: (pageParam) => fetchCars(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.result?.currentPage < lastPage?.result?.totalPages
        ? lastPage.result.currentPage + 1
        : null,
  });
  return (
    <div className="max-w-6xl mx-auto m-4 mt-10">
      <div className="shadow-md border rounded-md border-solid border-neutral-300 p-4 mx-auto">
        <div className="flex justify-between">
          <div className="flex gap-2 justify-start">
            <Space wrap>
              <Select
                placeholder="Hãng xe"
                style={{ width: 130 }}
                onChange={(selected) => handleQueryChange("brand", selected)}
                value={brand || "Hãng xe"}
                options={[
                  {
                    value: "all",
                    label: "Hãng xe",
                  },
                  ...(brandsData?.result || []).map((brand) => ({
                    value: brand._id,
                    label: brand.name,
                  })),
                ]}
              />

              <Select
                placeholder="Số chỗ"
                style={{ width: 130 }}
                onChange={(selected) =>
                  handleQueryChange("numberSeat", selected)
                }
                value={numberSeat || "Số chỗ"}
                options={[
                  {
                    value: "all",
                    label: "Số chỗ ",
                  },
                  {
                    value: "4 chỗ",
                    label: "4 chỗ",
                  },
                  {
                    value: "5 chỗ",
                    label: "5 chỗ",
                  },
                  {
                    value: "7 chỗ",
                    label: "7 chỗ",
                  },
                  {
                    value: "8 chỗ",
                    label: "8 chỗ",
                  },
                ]}
              />
              <Select
                placeholder="Truyền Động"
                style={{ width: 130 }}
                onChange={(selected) =>
                  handleQueryChange("transmissions", selected)
                }
                value={transmissions || "Truyền động"}
                options={[
                  {
                    value: "all",
                    label: "Truyền động ",
                  },
                  {
                    value: "Số tự động",
                    label: "Số tự động",
                  },
                  {
                    value: "Số sàn",
                    label: "Số sàn",
                  },
                ]}
              />
            </Space>
          </div>
          <Button onClick={showSortModal} icon={<FilterFilledIcon />}>
            Sắp xếp theo
          </Button>

          <Modal
            title="Sắp xếp theo"
            open={sortModalVisible}
            onOk={handleSortOk}
            onCancel={handleSortCancel}
          >
            <div>
              <h4>Giá</h4>
              <Slider
                style={{ width: 200 }}
                range
                step={100}
                min={0}
                max={3000000}
                value={[costGte || 0, costLte || 3000000]}
                onChange={handleCostChange}
              />
            </div>
            <div>
              <h4>Sắp xếp theo</h4>
              <Radio.Group
                onChange={(e) => handleQueryChange("sort", e.target.value)}
                value={newQuery.sort || "all"}
              >
                <Space direction="vertical">
                  <Radio value="all">Tất cả</Radio>
                  <Radio value="cost">Giá tăng dần</Radio>
                  <Radio value="-cost">Giá giảm dần</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Modal>
        </div>
      </div>

      <div className="">
        <InfiniteScroll
          dataLength={
            data?.pages?.flatMap((page) => page?.result?.cars).length || 0
          }
          next={fetchNextPage}
          hasMore={hasNextPage}
          onScroll={false}
          // loader={
          //   <div className="overflow-hidden flex justify-center mt-4">
          //     <Spin
          //       indicator={
          //         <LoadingOutlined
          //           style={{
          //             fontSize: 40,
          //           }}
          //           spin
          //         />
          //       }
          //     />
          //   </div>
          // }
        >
          {isLoading ? (
            <div className="example flex justify-center mt-40 overflow-hidden items-center max-w-6xl">
              <Spin size="large" />
            </div>
          ) : data?.pages?.flatMap((page) => page?.result?.cars)?.length > 0 ? (
            <div className="mx-auto grid grid-cols-4 gap-4 mt-11">
              {data?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page?.result?.cars.map((car, carIndex) => (
                    <Link key={carIndex} href={`/cars/${car?._id}`}>
                      <CarCard dataCar={car} />
                    </Link>
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">No cars found.</div>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}
