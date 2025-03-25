import Layout from "~/layouts/layout";
import Image from "next/image";
import { BackgroundLines } from "~/components/aceternity/backgroundLines";

const HomePage = () => {
  return (
    <main className="w-full h-full bg-white rounded-2xl shadow-xl relative">
      <BackgroundLines className="flex flex-col items-center justify-center gap-8">
        <div className="relative w-2/3 h-52 mx-auto">
          <Image
            src="/PPAM Logo.png"
            alt="PPAM Logo"
            fill
            sizes="33vw"
            className="object-contain"
            priority
          />
        </div>
        <div className="container mx-auto flex flex-col items-center text-center">
          <h1 className="font-bold leading-none text-primary text-3xl">
            <div className="no-underline">Welcome to the</div>
            <div className="text-black text-5xl underline decoration-secondary">Patterson Park <br />Music Academy</div>
          </h1>
        </div>
      </BackgroundLines>
    </main>
  );
};

HomePage.getLayout = (page: React.ReactElement) => <Layout>{page}</Layout>;

export default HomePage;