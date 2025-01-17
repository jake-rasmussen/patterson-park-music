import { Button } from "@nextui-org/button";
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { Family, User } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import EditFamily from "./editFamily";

type PropType = {
  families: (Family & {
    users: User[]
  })[];
  users: User[];
}

const ManageFamilies = (props: PropType) => {
  const { families, users } = props;
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedFamily, setSelectedFamily] = useState<(Family & {
    users: User[]
  })>();

  const utils = api.useUtils();

  const deleteFamily = api.family.deleteFamily.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully deleted family!");

      utils.family.getAllFamilies.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  })

  return (
    <div className="flex flex-col gap-4 items-center w-full justify-center">
      {
        families?.map((family: (Family & {
          users: User[]
        })) => (
          <Card key={family.id} className="w-full">
            <CardBody className="flex flex-row items-center justify-between truncate">
              <div className="max-w-full grow flex flex-col gap-2 p-4 truncate">
                <p className="text-md truncate">{family.familyName}</p>

                <p className="text-sm text-default-500 truncate">

                </p>
              </div>

              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly className="hover:cursor-pointer" variant="light">
                    <IconDotsVertical />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="edit"
                    startContent={<IconEdit />}
                    onClick={() => {
                      setSelectedFamily(family);
                      onOpen();
                    }}
                  >
                    Edit Family
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<IconTrash />}
                    onClick={() => {
                      // handleDelete(message);
                    }}
                  >
                    Delete Family
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardBody>
          </Card>
        ))
      }

      {
        selectedFamily && (
          <EditFamily
            selectedFamily={selectedFamily}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            users={users}
          />
        )
      }
    </div>
  )

}

export default ManageFamilies;