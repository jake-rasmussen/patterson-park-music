import { api } from "~/utils/api";
import Error from "next/error";

import ManageStudents from "~/components/user/manageStudents";

export default function StudentRosterPage() {
  const { data: users, isLoading, error } = api.user.getAllUsers.useQuery();

  if (error) {
    return <Error statusCode={error?.data?.httpStatus || 500} />
  } else {
    return (
      <main className="flex flex-row gap-8 h-full">
        <section className="grow bg-white rounded-xl flex flex-col gap-8 p-8 overflow-auto max-h-full">
          <ManageStudents users={users || []} isLoading={false} />
        </section>
      </main>
    )
  }
}