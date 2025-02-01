import Layout from "~/layouts/layout";

const HomePage = () => {
  return (
    <main className="w-full h-full bg-white rounded-2xl shadow-xl flex flex-col justify-center items-center">
      <h1 className="text-5xl font-black underlined">Patterson Park Music</h1>
      <p>Use the navbar to get started</p>
    </main>
  );
};

HomePage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default HomePage;