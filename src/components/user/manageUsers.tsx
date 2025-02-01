import { Family, User, USER_TYPE } from "@prisma/client";
import UserTable from "./userTable";
import CreateUserModal from "./createUserModal";
import { useDisclosure } from "@nextui-org/modal";
import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Divider, Spinner, Tab, Tabs } from "@nextui-org/react";
import { IconSearch, IconPlus, IconSchool, IconUser, IconApple, IconUsersGroup } from "@tabler/icons-react";
import { capitalizeToUppercase } from "~/utils/helper";
import CreateFamilyModal from "./family/createFamilyModal";
import UserIcon from "./userIcon";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  isLoading: boolean;
}

const ManageUsers = (props: PropType) => {
  const { users, isLoading } = props;

  const { isOpen: isOpenCreateUser, onOpen: onOpenCreateUser, onOpenChange: onOpenChangeCreateUser } = useDisclosure();
  const { isOpen: isOpenCreateFamily, onOpen: onOpenCreateFamily, onOpenChange: onOpenChangeCreateFamily } = useDisclosure();

  const [select, setSelect] = useState<boolean>();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedType, setSelectedType] = useState<USER_TYPE>(USER_TYPE.STUDENT);
  const [query, setQuery] = useState("");

  const handleSelection = (newSelectedUsers: User[]) => {
    setSelectedUsers((prevSelectedUsers) => {
      const selectedIds = newSelectedUsers.map((user) => user.id);

      const remainingUsers = prevSelectedUsers.filter((user) =>
        selectedIds.includes(user.id)
      );

      const userMap = new Map(remainingUsers.map((user) => [user.id, user]));
      newSelectedUsers.forEach((user) => userMap.set(user.id, user));

      return Array.from(userMap.values());
    });
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h2 className="text-xl text-center">User List</h2>
      <Divider />
      <div className="h-full">
        {
          isLoading ? (
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

              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-row">
                  <Input
                    isClearable
                    className="max-w-xs"
                    placeholder="Search by name"
                    startContent={<IconSearch />}
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    onClear={() => setQuery("")}
                  />

                  <div className="grow flex justify-end gap-4">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button color="primary" endContent={<IconPlus />}>
                          Create New
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="user"
                          onClick={onOpenCreateUser}
                          endContent={<UserIcon userType={selectedType} />}
                        >
                          Create {capitalizeToUppercase(selectedType)}
                        </DropdownItem>
                        <DropdownItem
                          key="family"
                          onClick={() => {
                            if (setSelect) {
                              setSelect(true);
                            }
                          }}
                          endContent={<IconUsersGroup />}
                        >
                          Create Family
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>

                {!isLoading && (
                  <>
                    <UserTable
                      users={users}
                      type={selectedType}
                      select={select}
                      onSelectionChange={handleSelection}
                    />

                    {
                      select && (
                        <div className="flex flex-row gap-4 w-full justify-end">
                          <Button
                            variant="light"
                            color="danger"
                            onClick={() => {
                              setSelect(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            color="primary"
                            onClick={() => {
                              onOpenCreateFamily();
                            }}
                            isDisabled={selectedUsers.length === 0}
                          >
                            Submit
                          </Button>
                        </div>
                      )
                    }
                  </>
                )}


                <CreateUserModal isOpen={isOpenCreateUser} onOpenChange={onOpenChangeCreateUser} type={selectedType} />
                <CreateFamilyModal
                  isOpen={isOpenCreateFamily}
                  onOpenChange={onOpenChangeCreateFamily}
                  users={users}
                  selectedUsers={selectedUsers}
                  setSelect={setSelect}
                  setSelectedUsers={setSelectedUsers}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default ManageUsers;