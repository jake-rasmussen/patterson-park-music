import { Toaster } from "react-hot-toast";
import { type AppType } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { Poppins } from "@next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Wrapper from "~/components/wrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={`${poppins.variable} font-sans`}>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style jsx global>{`
      :root {
        --font-poppins: ${poppins.style.fontFamily};
      }
    `}</style>
      <Toaster />
      <NextUIProvider>
        <Wrapper>
          <Component {...pageProps} />
        </Wrapper>
      </NextUIProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
