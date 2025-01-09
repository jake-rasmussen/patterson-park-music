import Navbar from "./navbar";

type PropType = {
  children: JSX.Element;
  isAuthenticated: boolean;
  hideChildren: boolean;
}

const Wrapper = (props: PropType) => {
  const { children, isAuthenticated, hideChildren } = props;

  return (
    <main className="bg-gray-900 flex flex-row h-screen overflow-auto">
      {
        isAuthenticated && (
          <div className="min-w-fit h-screen flex flex-col gap-8 justify-center items-center py-10">
            <Navbar />
          </div>
        )
      }

      {
        !hideChildren && (
          <div className="grow my-8 mr-8 shadow-xl flex flex-col">
            {children}
          </div>
        )
      }
    </main>
  )

}

export default Wrapper;