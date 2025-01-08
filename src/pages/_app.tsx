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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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

  if (isCheckingAuth) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner label="Loading..." className="m-auto" size="lg" />
      </div>
    );
  } else {
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
          <Wrapper isAuthenticated={isAuthenticated ?? false}>
            <Component {...pageProps} />
          </Wrapper>
        </NextUIProvider>
      </div>
    );
  }
};

export default api.withTRPC(MyApp);