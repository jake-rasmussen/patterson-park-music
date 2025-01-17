import { api } from "~/utils/api";
import Error from "next/error";

import ManageUsers from "~/components/user/manageUsers";
import ManageFamilies from "~/components/user/family/manageFamilies";

export default function ContactPage() {
  const { data: users, isLoading: isLoadingUsers, error: errorUsers } = api.user.getAllUsers.useQuery();
  const { data: families, isLoading: isLoadingFamilies, error: errorFamilies } = api.family.getAllFamilies.useQuery();

  if (errorUsers || errorFamilies) {
    return <Error
      statusCode={
        errorUsers?.data?.httpStatus ||
        errorFamilies?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="flex flex-row gap-8 h-full">
        <section className="grow bg-white rounded-xl flex flex-col gap-8 p-8 overflow-auto max-h-full">
          <ManageUsers users={users || []} isLoading={false} />
        </section>

        <section className="w-1/4 bg-white rounded-xl flex flex-col gap-8 p-8 overflow-auto max-h-full">
          <ManageFamilies families={families || []} users={users || []} isLoading={isLoadingFamilies} />
        </section>
      </main>
    )
  }
}