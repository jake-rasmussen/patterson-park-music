import { NextUIProvider, Spinner } from "@nextui-org/react";
import { Poppins } from "@next/font/google";
import { Toaster } from "react-hot-toast";
import "~/styles/globals.css";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { AuthProvider, useAuth } from "~/context/auth-context";
import { api } from "~/utils/api";
import Navbar from "~/components/navbar";
import LoginPage from "./login";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <div className={`${poppins.variable} font-sans`}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <style jsx global>{`
        :root {
          --font-poppins: ${poppins.style.fontFamily};
        }
      `}</style>
      <Toaster />
      <NextUIProvider>
        <AuthProvider>
          <AuthConsumer>
            <main className="bg-gray-900 flex flex-row h-screen overflow-auto">
              <div className="min-w-fit h-screen flex flex-col gap-8 justify-center items-center py-10">
                <Navbar />
              </div>
              <div className="grow my-8 mr-8 shadow-xl flex flex-col">
                {getLayout(<Component {...pageProps} />)}
              </div>
            </main>
          </AuthConsumer>
        </AuthProvider>
      </NextUIProvider>
    </div>
  );
}

const AuthConsumer = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner label="Loading..." className="m-auto" />
      </div>
    );
  } else if (!user) {
    return <LoginPage />
  } else {
    return children;
  }
};

export default api.withTRPC(MyApp);