
import { getBrands } from "@/apis/brands.api";
import { getListCars } from "@/apis/user-cars.api";
import { CarCard } from "@/components/CarCard";
import { GET_BRANDS_KEY } from "@/constants/react-query-key.constant";
import { FilterFilledIcon } from "@/icons";
import { formatCurrency } from "@/utils/number.utils";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Button,
  Drawer,
  Empty,
  Input,
  Modal,
  Radio,
  Select,
  Slider,
  Space,
  Spin,
} from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";
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
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

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

  const totalCars = data?.pages?.[0]?.result?.cars?.length || 0;
  const activeFilters = Object.keys(query).filter(
    (key) => key !== "sort" && query[key] !== "all" && query[key] !== undefined
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách xe</h1>
        <p className="text-gray-600">
          Tìm kiếm và thuê xe phù hợp với nhu cầu của bạn
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Desktop Filters */}
          <div className="flex flex-wrap gap-3 justify-start">
            <Select
              placeholder="Hãng xe"
              style={{ width: 130 }}
              onChange={(selected) => handleQueryChange("brand", selected)}
              value={brand || "Hãng xe"}
              className="rounded-lg"
              options={[
                {
                  value: "all",
                  label: "Tất cả hãng xe",
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
              onChange={(selected) => handleQueryChange("numberSeat", selected)}
              value={numberSeat || "Số chỗ"}
              className="rounded-lg"
              options={[
                {
                  value: "all",
                  label: "Tất cả số chỗ",
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
              className="rounded-lg"
              options={[
                {
                  value: "all",
                  label: "Tất cả loại số",
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

            <Input.Search
              placeholder="Tìm kiếm xe..."
              style={{ width: 200 }}
              className="rounded-lg"
            />
          </div>

          {/* Sort and Filter Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setFilterDrawerVisible(true)}
              icon={<FilterFilledIcon />}
              className={`flex items-center gap-1 rounded-lg ${
                activeFilters > 0
                  ? "bg-green-50 text-green-600 border-green-200"
                  : ""
              }`}
            >
              Bộ lọc {activeFilters > 0 && `(${activeFilters})`}
            </Button>

            <Button
              onClick={showSortModal}
              className="flex items-center gap-1 rounded-lg"
            >
              <span>Sắp xếp</span>
              {sort && (
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          {isLoading ? (
            <span>Đang tải...</span>
          ) : (
            <span>
              Tìm thấy <strong>{totalCars}</strong> xe
            </span>
          )}
        </div>

        {/* Active Filters */}
        {(costGte || costLte) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Giá:</span>
            <div className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
              {formatCurrency(costGte || 0)} -{" "}
              {formatCurrency(costLte || 3000000)}
              <button
                className="ml-2 text-green-700 hover:text-green-900"
                onClick={() => handleCostChange([0, 3000000])}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Car Grid */}
      <div className="min-h-[400px]">
        <InfiniteScroll
          dataLength={
            data?.pages?.flatMap((page) => page?.result?.cars).length || 0
          }
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={
            <div className="flex justify-center my-8">
              <Spin size="large" />
            </div>
          }
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : data?.pages?.flatMap((page) => page?.result?.cars)?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page?.result?.cars.map((car) => (
                    <CarCard key={car?._id} dataCar={car} />
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Empty
                description="Không tìm thấy xe phù hợp với bộ lọc của bạn"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <Button
                type="primary"
                onClick={() => router.push("/cars")}
                className="mt-4 bg-green-500 hover:bg-green-600 border-none rounded-lg"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </InfiniteScroll>
      </div>

      {/* Filter Drawer (Mobile) */}
      <Drawer
        title="Bộ lọc tìm kiếm"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={320}
        footer={
          <div className="flex justify-between">
            <Button
              onClick={() => {
                router.push("/cars");
                setFilterDrawerVisible(false);
              }}
            >
              Xóa bộ lọc
            </Button>
            <Button
              type="primary"
              onClick={() => setFilterDrawerVisible(false)}
              className="bg-green-500 hover:bg-green-600"
            >
              Áp dụng
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Hãng xe</h4>
            <Select
              placeholder="Chọn hãng xe"
              style={{ width: "100%" }}
              onChange={(selected) => handleQueryChange("brand", selected)}
              value={brand || "all"}
              options={[
                {
                  value: "all",
                  label: "Tất cả hãng xe",
                },
                ...(brandsData?.result || []).map((brand) => ({
                  value: brand._id,
                  label: brand.name,
                })),
              ]}
            />
          </div>

          <div>
            <h4 className="font-medium mb-3">Số chỗ ngồi</h4>
            <Radio.Group
              onChange={(e) => handleQueryChange("numberSeat", e.target.value)}
              value={numberSeat || "all"}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="all">Tất cả số chỗ</Radio>
                <Radio value="4 chỗ">4 chỗ</Radio>
                <Radio value="5 chỗ">5 chỗ</Radio>
                <Radio value="7 chỗ">7 chỗ</Radio>
                <Radio value="8 chỗ">8 chỗ</Radio>
              </Space>
            </Radio.Group>
          </div>

          <div>
            <h4 className="font-medium mb-3">Truyền động</h4>
            <Radio.Group
              onChange={(e) =>
                handleQueryChange("transmissions", e.target.value)
              }
              value={transmissions || "all"}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="all">Tất cả loại số</Radio>
                <Radio value="Số tự động">Số tự động</Radio>
                <Radio value="Số sàn">Số sàn</Radio>
              </Space>
            </Radio.Group>
          </div>

          <div>
            <h4 className="font-medium mb-3">Khoảng giá (VND)</h4>
            <div className="px-2">
              <Slider
                range
                step={100000}
                min={0}
                max={3000000}
                value={[
                  Number.parseInt(costGte || 0),
                  Number.parseInt(costLte || 3000000),
                ]}
                onChange={handleCostChange}
                tooltip={{
                  formatter: (value) => formatCurrency(value),
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{formatCurrency(costGte || 0)}</span>
                <span>{formatCurrency(costLte || 3000000)}</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Sort Modal */}
      <Modal
        title="Sắp xếp theo"
        open={sortModalVisible}
        onOk={handleSortOk}
        onCancel={handleSortCancel}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        <Radio.Group
          onChange={(e) => handleQueryChange("sort", e.target.value)}
          value={sort || "all"}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            <Radio value="all" className="py-2">
              Mặc định
            </Radio>
            <Radio value="cost" className="py-2">
              Giá tăng dần
            </Radio>
            <Radio value="-cost" className="py-2">
              Giá giảm dần
            </Radio>
            <Radio value="-createdAt" className="py-2">
              Mới nhất
            </Radio>
            <Radio value="-totalRatings" className="py-2">
              Đánh giá cao nhất
            </Radio>
          </Space>
        </Radio.Group>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSortCancel} className="mr-2">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSortOk}
            className="bg-green-500 hover:bg-green-600"
          >
            Áp dụng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
