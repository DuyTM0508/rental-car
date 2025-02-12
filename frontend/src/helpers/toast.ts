import { ImageSource } from "@/assets";
import { isString } from "lodash";
import { toast, ToastOptions } from "react-toastify";

export const toastContainer = {
  success: "bg-toast-success border-toast-borderSuccess",
  error: "bg-toast-error border-toast-borderError",
  info: "bg-gray-600",
  warning: "bg-orange-400",
  default: "bg-indigo-600",
  dark: "bg-white-600 font-gray-300",
};

export const toastBody = {
  success: " text-toast-textSuccess",
  error: " text-toast-textError",
  info: " text-toast-textSuccess",
  warning: " text-toast-textSuccess",
  default: " text-toast-textSuccess",
  dark: " text-toast-textSuccess ",
};

export const toastIcons = {
  success: ImageSource.successIcon,
  error: ImageSource.errorIcon,
  info: ImageSource.successIcon,
  warning: ImageSource.successIcon,
  default: ImageSource.successIcon,
  dark: ImageSource.successIcon,
};

export const toastCloseIcons = {
  success: ImageSource.closeSuccess,
  error: ImageSource.closeErrorIcon,
  info: ImageSource.successIcon,
  warning: ImageSource.successIcon,
  default: ImageSource.successIcon,
  dark: ImageSource.successIcon,
};

export const showSuccess = (msg: any, options?: ToastOptions) => {
  if (isString(msg)) {
    toast.success(msg, options);
    return;
  }

  toast.success("Error default");
};

export const showError = (error: any, options?: ToastOptions) => {
  if (error?.response) {
    if (error?.response?.data?.Error) {
      toast.error(JSON.stringify(error?.response?.data?.errors));
      return;
    }

    if (error?.response?.data?.title) {
      toast.error(JSON.stringify(error?.response?.data?.title));
      return;
    }
    if (error?.response?.data?.message) {
      toast.error(error?.response?.data?.message);
      return;
    }
  }

  if (isString(error) || isString(error.toString())) {
    toast.error(error, options);
    return;
  }

  toast.error("Error default");
};
