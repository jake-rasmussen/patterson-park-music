import { Divider, Spinner, Tab, Tabs } from "@nextui-org/react";
import { api } from "~/utils/api";
import Error from "next/error";

import { useState } from "react";
import { IconApple, IconSchool, IconUser } from "@tabler/icons-react";
import { USER_TYPE } from "@prisma/client";
import ManageUsers from "~/components/user/manageUsers";
import ManageFamilies from "~/components/user/family/manageFamilies";

export default function ContactPage() {
  const { data: users, isLoading: isLoadingUsers, error: errorUsers } = api.user.getAllUsers.useQuery();

  const { data: families, isLoading: isLoadingFamilies, error: errorFamilies } = api.family.getAllFamilies.useQuery();

  const [selectedType, setSelectedType] = useState<USER_TYPE>(USER_TYPE.STUDENT);

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
          <h2 className="text-xl text-center">User List</h2>
          <Divider />
          <div className="h-full">
            {
              isLoadingUsers ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner label="Loading..." className="m-auto" />
                </div>
              ) : (
                <div className="flex flex-col gap-8 items-center w-full justify-center">
                  <Tabs onSelectionChange={(e) => {
                    if (e === "students") setSelectedType(USER_TYPE.STUDENT);
                    else if (e === "parents") setSelectedType(USER_TYPE.PARENT);
                    else if (e === "teachers") setSelectedType(USER_TYPE.TEACHER);
                  }}>
                    <Tab
                      key="students"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconSchool />
                          <span>Students</span>
                        </div>
                      }
                      className="w-full"
                    />
                    <Tab
                      key="parents"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconUser />
                          <span>Parents</span>
                        </div>
                      }
                      className="w-full"
                    />
                    <Tab
                      key="teachers"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconApple />
                          <span>Teachers</span>
                        </div>
                      }
                      className="w-full"
                    />
                  </Tabs>

                  <ManageUsers
                    users={users || []}
                    type={selectedType}
                  />
                </div>
              )}
          </div>
        </section>

        <section className="w-1/4 bg-white rounded-xl flex flex-col gap-8 p-8 overflow-auto max-h-full">
          <h2 className="text-xl text-center">Family List</h2>
          <Divider />
          <div className="h-full">
            {
              isLoadingFamilies ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner label="Loading..." className="m-auto" />
                </div>
              ) : (
                <ManageFamilies families={families || []} users={users || []}/>
              )}
          </div>
        </section>
      </main>
    )
  }
}