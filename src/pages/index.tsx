import Layout from "~/layouts/layout";
import Image from "next/image";

const HomePage = () => {
  return (
    // <main className="w-full min-h-screen bg-white rounded-2xl shadow-xl flex flex-col items-center p-8 gap-4">
    //   <div className="relative w-2/3 h-52">
    //     <Image
    //       src="/PPAM Logo.png"
    //       alt="PPAM Logo"
    //       fill
    //       sizes="33vw"
    //       className="object-contain"
    //       priority
    //     />
    //   </div>
    //   <h3 className="text-xl font-bold text-center">
    //     Welcome to the <br />Patterson Park Academy of Music!
    //   </h3>
    // </main>
    <main className="w-full min-h-screen bg-white rounded-2xl shadow-xl">
      <div className="py-32 px-32 flex flex-col items-center gap-8">
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
      </div>
    </main>
  );
};

HomePage.getLayout = (page: React.ReactElement) => <Layout>{page}</Layout>;

export default HomePage;