import Navbar from "../components/navbar";

const Layout = ({ children }: { children: JSX.Element }) => {
  return (
    <main className="bg-gray-900 flex flex-row h-screen overflow-auto">
      <div className="min-w-fit h-screen flex flex-col gap-8 justify-center items-center py-10">
        <Navbar />
      </div>
      <div className="grow my-8 mr-8 shadow-xl flex flex-col">
        {children}
      </div>
    </main>
  );
}

export default Layout;