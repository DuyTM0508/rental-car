import { usePayOS, PayOSConfig } from "payos-checkout";

const payOSConfig = {
  RETURN_URL: `${process.env.NEXT_PUBLIC_REACT_APP_FRONTEND_URL}`, // required
  ELEMENT_ID: ``, // required
  CHECKOUT_URL: ``, // required
  embedded: true, // Nếu dùng giao diện nhúng
  onSuccess: (event) => {
    //TODO: Hành động sau khi người dùng thanh toán đơn hàng thành công
  },
  onCancel: (event) => {
    //TODO: Hành động sau khi người dùng Hủy đơn hàng
  },
  onExit: (event) => {
    //TODO: Hành động sau khi người dùng tắt Pop up
  },
};
