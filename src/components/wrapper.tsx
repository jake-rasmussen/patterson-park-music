import Navbar from "./navbar";

type PropType = {
  children: JSX.Element;
  isAuthenticated: boolean;
}

const Wrapper = (props: PropType) => {
  const { children, isAuthenticated } = props;

  return (
    <main className="bg-gray-900 flex flex-row min-h-screen overflow-auto">
      {
        isAuthenticated && (
          <div className="min-w-fit h-screen flex flex-col gap-8 justify-center items-center py-10">
            <Navbar />
          </div>
        )
      }

      <div className="grow my-8 mr-8 shadow-xl flex flex-col">
        {children}
      </div>
    </main>
  )

}

export default Wrapper;