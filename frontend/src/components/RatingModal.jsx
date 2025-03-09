import React, { useEffect } from "react";
import { Modal, Button, Input, Rate, notification } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRating,
  getRatingByBooking,
  updateRatingByBooking,
} from "@/apis/ratings.api";
import { GET_RATING_BY_BOOKING } from "@/constants/react-query-key.constant";

const RatingModal = ({ open, handleCancel, bookingId, carId, accessToken }) => {
  const checkRated = useQuery({
    queryKey: [GET_RATING_BY_BOOKING, { accessToken, bookingId }],
    queryFn: () => getRatingByBooking(accessToken, bookingId),
    enabled: open, // Chỉ gọi khi modal được mở
    refetchOnWindowFocus: false, // Tắt tự động gọi lại khi cửa sổ focus
  });
  const { TextArea } = Input;
  const [star, setStar] = React.useState(5);
  const [comment, setComment] = React.useState("");
  useEffect(() => {
    if (checkRated.isSuccess && checkRated.data?.result.length > 0) {
      const existingRating = checkRated.data.result[0];
      setStar(existingRating.star);
      setComment(existingRating.comment);
    }
  }, [checkRated.isSuccess, checkRated.data]);
  const { mutate: rate } = useMutation(createRating, {
    onSuccess: () => {
      checkRated.refetch(); // Cập nhật lại dữ liệu đánh giá sau khi thêm mới
    },
  });
  const { mutate: updateRating } = useMutation(updateRatingByBooking, {
    onSuccess: () => {
      checkRated.refetch(); // Cập nhật lại dữ liệu đánh giá sau khi cập nhật
    },
  });
  const handleRatingChange = (value) => {
    setStar(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const hasRatings = checkRated.data?.result.length > 0;

  const handleRatingSubmit = async () => {
    try {
      if (!star) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng chọn số sao để đánh giá.",
        });
        return;
      }
      if (hasRatings) {
        await updateRating({ accessToken, bookingId, star, comment });

        notification.success({
          message: "Cập nhật đánh giá thành công",
          description: "Cảm ơn bạn đã cập nhật đánh giá xe!",
        });
      } else {
        await rate({ accessToken, bookingId, carId, star, comment });

        notification.success({
          message: "Đánh giá thành công",
          description: "Cảm ơn bạn đã đánh giá xe!",
        });
      }
      handleCancel();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi đánh giá. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleRatingSubmit}>
          {hasRatings ? "Cập nhật" : "Đánh giá"}
        </Button>,
      ]}
    >
      <div>
        <h3>Đánh giá</h3>
        <div>
          <Rate
            className="mb-5"
            allowHalf
            value={star}
            onChange={handleRatingChange}
          />
          <TextArea
            value={comment}
            allowClear
            className="bg-white"
            onChange={handleCommentChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export default RatingModal;
