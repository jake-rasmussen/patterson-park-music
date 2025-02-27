import { HeroUIProvider, Spinner } from "@heroui/react";
import { Poppins } from "@next/font/google";
import { Toaster } from "react-hot-toast";
import "~/styles/globals.css";
import type { AppProps } from "next/app";
import { type ReactElement, type ReactNode } from "react";
import type { NextPage } from "next";
import { AuthProvider, useAuth } from "~/context/auth-context";
import { api } from "~/utils/api";
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
      <style jsx global>{`
        :root {
          --font-poppins: ${poppins.style.fontFamily};
        }
      `}</style>
      <Toaster />
      <HeroUIProvider>
        <AuthProvider>
          <AuthConsumer>
            {getLayout(<Component {...pageProps} />)}
          </AuthConsumer>
        </AuthProvider>
      </HeroUIProvider>
    </div>
  );
}

const AuthConsumer = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner label="Loading..." className="m-auto" />
      </div>
    );
  }
  if (!user) {
    return <LoginPage />;
  }

  return children;
};

export default api.withTRPC(MyApp);