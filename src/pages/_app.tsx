import { Toaster } from "react-hot-toast";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NextUIProvider, Spinner } from "@nextui-org/react";
import { Poppins } from "@next/font/google";

import { api } from "~/utils/api";
import "~/styles/globals.css";
import Wrapper from "~/components/wrapper";
import { createClient } from "~/utils/supabase/client/component";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const checkAuthentication = async () => {
      setIsCheckingAuth(true);
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setIsAuthenticated(false);

        if (router.pathname !== "/login") {
          router.push("/login");
        }
      } else {
        setIsAuthenticated(true);
      }

      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, []);

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
        {
          isCheckingAuth ? (
            <div className="w-full h-screen bg-gray-900 p-8">
              <div className="w-full h-full bg-white rounded-2xl flex justify-center items-center">
                <Spinner label="Loading..." size="lg" />
              </div>
            </div>
          ) : (
            <Wrapper isAuthenticated={isAuthenticated ?? false} hideChildren={!isAuthenticated && !router.pathname.includes("login")}>
              <Component {...pageProps} />
            </Wrapper>
          )
        }
      </NextUIProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);