import Navbar from "./navbar";

type PropType = {
  children: JSX.Element;
}

const Wrapper = (props: PropType) => {
  const { children } = props;

  return (
    <main className="bg-gray-900 flex flex-row h-screen">
      <div className="min-w-28 h-screen flex flex-col gap-8 justify-center items-center py-10">
        <Navbar />
      </div>
      
      <div className="grow my-8 mr-8 shadow-xl flex flex-col min-h-0">
        {children}
      </div>
    </main>
  )

}

export default Wrapper;