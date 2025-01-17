import { User, USER_TYPE } from "@prisma/client";
import UserTable from "./userTable";
import CreateUser from "./createUser";
import { useDisclosure } from "@nextui-org/modal";
import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { IconSearch, IconPlus, IconSchool, IconUser, IconApple, IconUsersGroup } from "@tabler/icons-react";
import { capitalizeToUppercase } from "~/utils/helper";
import CreateFamily from "./family/createFamily";

type PropType = {
  users: User[];
  type: USER_TYPE;
}

const ManageUsers = (props: PropType) => {
  const { users, type } = props;

  const { isOpen: isOpenCreateUser, onOpen: onOpenCreateUser, onOpenChange: onOpenChangeCreateUser } = useDisclosure();
  const { isOpen: isOpenCreateFamily, onOpen: onOpenCreateFamily, onOpenChange: onOpenChangeCreateFamily } = useDisclosure();

  const [select, setSelect] = useState<boolean>();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

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
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-row">
        <Input
          isClearable
          className="max-w-xs"
          placeholder="Search by name"
          startContent={<IconSearch />}
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
                endContent={
                  type === USER_TYPE.STUDENT ? <IconSchool /> :
                    type === USER_TYPE.PARENT ? <IconUser /> :
                      <IconApple />
                }
              >
                Create {capitalizeToUppercase(type)}
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

      <UserTable
        users={users}
        type={type}
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

      <CreateUser isOpen={isOpenCreateUser} onOpenChange={onOpenChangeCreateUser} type={type} />
      <CreateFamily
        isOpen={isOpenCreateFamily}
        onOpenChange={onOpenChangeCreateFamily}
        users={users}
        selectedUsers={selectedUsers}
        setSelect={setSelect}
        setSelectedUsers={setSelectedUsers}
      />
    </div>
  )
}

export default ManageUsers;