import { Modal, Button, Space } from "antd";
import { CouponIcon, SaleIcon } from "@/icons";
import { CloseCircleFilled } from "@ant-design/icons";
import { useState } from "react";
import { GET_COUPONS } from "@/constants/react-query-key.constant";
import { getCoupons } from "@/apis/user-cars.api";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

const Coupon = ({ applyCoupon }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCouponClick = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(false);
    applyCoupon(coupon);
  };

  const handleCancelSelection = () => {
    setSelectedCoupon(null);
    applyCoupon(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { data: coupons } = useQuery({
    queryKey: [GET_COUPONS],
    queryFn: getCoupons,
  });
  const expiryDay = coupons?.result.map((value, idx) => ({
    timeExpired: moment(value?.timeExpired).format("DD-MM-YYYY HH:mm:ss"),
  }));
  const isCouponExpired = (timeExpired) => {
    const currentDateTime = moment();
    const couponExpiryDateTime = moment(timeExpired, "DD-MM-YYYY HH:mm:ss");
    return currentDateTime.isAfter(couponExpiryDateTime);
  };

  return (
    <div className="">
      {selectedCoupon ? (
        <Space>
          <span>{selectedCoupon.name}</span>
          <span className="text-green-400">-{selectedCoupon.discount}%</span>
          <CloseCircleFilled
            className="cursor-pointer text-red-500"
            onClick={handleCancelSelection}
          />
        </Space>
      ) : (
        <div
          onClick={showModal}
          className="w-full h-12 flex items-center cursor-pointer"
        >
          <CouponIcon className="mb-1" />
          <div className="text-base p-2">Sử dụng mã giảm giá</div>
        </div>
      )}
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={500}
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <div>
          <h2 className="text-lg text-center font-bold mb-4">
            Chọn mã giảm giá
          </h2>
          <div className="coupon-options">
            {coupons?.result.map((value, index) => (
              <div key={index} className="coupon-option cursor-pointer mb-2">
                <div className="flex w-full pb-4">
                  <SaleIcon />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col pl-4 justify-between">
                      <div className="flex">
                        <h3 className="m-0">{value.name}</h3>
                        <span className="text-xs ml-2 text-green-400">
                          -{value.discount}%
                        </span>
                      </div>
                      <p className="m-0 max-w-lg">{value.description}</p>
                    </div>
                    {isCouponExpired(expiryDay[index].timeExpired) ? (
                      <Button
                        className=""
                        onClick={() => handleCouponClick(value)}
                        disabled
                      >
                        Hết hạn
                      </Button>
                    ) : (
                      <Button
                        className="bg-green-400 text-white hover:bg-green-500"
                        onClick={() => handleCouponClick(value)}
                      >
                        Áp dụng
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Coupon;
