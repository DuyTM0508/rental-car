import "./global.css";

import { queryClient } from "@/apis/client";
import { themeConfigs } from "@/configs/ant.config";
import { UserWebLayout } from "@/layouts/UserLayout";
import i18n from "@/utils/i18n.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RecoilRoot } from "recoil";

function MyApp({ Component, pageProps }) {
  const { Layout = UserWebLayout, title = "Rental Car" } = Component;
  const [isI18nInitialised, setIsI18nInitialised] = useState(false);
  useEffect(() => {
    async function initializeI18n() {
      await i18n.use(initReactI18next).init({
        // backend: {
        //   loadPath: "/locales/en/translation.json", // Specify the path to your translation files
        // },

        debug: true, // Enable debug mode for development
        interpolation: {
          escapeValue: false, // React already escapes values by default
        },
        detection: {
          order: ["localStorage", "cookie", "navigator"],
        },
        react: {
          useSuspense: false, // Disable Suspense for React
        },
      });
      setIsI18nInitialised(true);
    }

    initializeI18n();
  }, []);
  return (
    <>
      {isI18nInitialised && (
        <I18nextProvider i18n={i18n}>
          <RecoilRoot>
            <QueryClientProvider client={queryClient}>
              <ConfigProvider theme={themeConfigs}>
                <Layout>
                  <ToastContainer />
                  <Component {...pageProps} />
                </Layout>
              </ConfigProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </RecoilRoot>
        </I18nextProvider>
      )}
    </>
  );
}

export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});
