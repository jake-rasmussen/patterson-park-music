import { api } from "~/utils/api";
import Error from "next/error";

import ManageStudents from "~/components/user/manageStudents";
import Layout from "~/layouts/layout";

const StudentRosterPage = () => {
  const { data: users, isLoading, error } = api.user.getAllUsers.useQuery();

  if (error) {
    return <Error statusCode={error?.data?.httpStatus || 500} />
  } else {
    return (
      <main className="flex flex-row gap-8 h-full">
        <section className="grow bg-white rounded-xl flex flex-col gap-8 p-8 overflow-auto max-h-full min-w-96">
          <ManageStudents users={users || []} isLoading={isLoading} />
        </section>
      </main>
    )
  }
}

StudentRosterPage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default StudentRosterPage;