import { Divider, Spinner, Tab, Tabs } from "@nextui-org/react";
import { api } from "~/utils/api";
import Error from "next/error";

import UserForm from "~/components/user/userForm";
import { useMemo, useState } from "react";
import UserTable from "~/components/user/userTable";
import CreateUser from "~/components/user/createUser";
import { IconApple, IconSchool } from "@tabler/icons-react";

export default function ContactPage() {
  const { data: users, isLoading, error, refetch } = api.user.getAllUsers.useQuery({
    skip: 0,
    take: 20,
  });

  const { teachers, students } = useMemo(() => {
    if (users) {
      const teachers = users.filter((user) => user.isTeacher);
      const students = users.filter((user) => !user.isTeacher);

      return { teachers, students };
    } else {
      return {};
    }
  }, [users]);

  if (error) {
    return <Error
      statusCode={
        error?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="flex flex-row gap-8 h-full">
        <section className="grow bg-white rounded-xl flex flex-col gap-8 p-8 overflow-auto max-h-full">
          <h2 className="text-xl text-center">User List</h2>
          <Divider />
          <div className="h-full">
            {
              isLoading ? <div className="w-full h-full flex justify-center items-center">
                <Spinner label="Loading..." className="m-auto" />
              </div> : <div className="flex flex-col gap-4 items-center w-full justify-center">
                <Tabs>
                  <Tab key="students" title={
                    <div className="flex items-center space-x-2">
                      <IconSchool />
                      <span>Students</span>
                    </div>
                  } className="w-full">
                    <UserTable users={students || []} />
                  </Tab>
                  <Tab key="teachers" title={
                    <div className="flex items-center space-x-2">
                      <IconApple />
                      <span>Teachers</span>
                    </div>
                  } className="w-full">
                    <UserTable users={teachers || []} />
                  </Tab>
                </Tabs>
              </div>
            }
          </div>
        </section>

        <div className="flex flex-col gap-8">
          <section className="bg-white rounded-xl h-fit flex flex-col gap-8 p-8 min-w-96">
            <CreateUser />
          </section>

          <section className="bg-white rounded-xl h-fit flex flex-col gap-8 p-8 min-w-96">
            <CreateUser isTeacher />
          </section>
        </div>
      </main>
    )
  }
}