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
        debug: true,
        interpolation: { escapeValue: false },
        detection: { order: ["localStorage", "cookie", "navigator"] },
        react: { useSuspense: false },
      });
      setIsI18nInitialised(true);
    }

    initializeI18n();

    // Thêm script Dialogflow
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
    script.async = true;
    document.body.appendChild(script);
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
                  {/* Chatbot Dialogflow */}
                  <df-messenger
                    intent="WELCOME"
                    chat-title="NewAgent"
                    agent-id="c208d366-749b-49ba-82eb-8c43e46002f2"
                    language-code="vi"
                  ></df-messenger>
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
