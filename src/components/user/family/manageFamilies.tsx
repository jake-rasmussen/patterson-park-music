import { Button } from "@nextui-org/button";
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Divider, Spinner } from "@nextui-org/react";
import { Family, User } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import EditFamilyModal from "./editFamilyModal";

type PropType = {
  families: (Family & {
    users: User[]
  })[];
  users: (User & {
    family: Family | null
  })[];
  isLoading: boolean;
}

const ManageFamilies = (props: PropType) => {
  const { families, users, isLoading } = props;

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
  });

  return (
    <section className="flex flex-col gap-8 items-center w-full h-full justify-center">
      <h2 className="text-xl text-center">Family List</h2>
      <Divider />
      <div className="h-full w-full">
        {
          isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner label="Loading..." className="m-auto" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {
                families?.map((family: (Family & {
                  users: User[]
                })) => (
                  <Card key={family.id} className="w-full">
                    <CardBody className="flex flex-row items-center justify-between truncate">
                      <div className="max-w-full grow flex flex-col gap-2 p-4 truncate">
                        <p className="text-md truncate">{family.familyName}</p>
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
                              toast.loading("Deleting section...");
                              deleteFamily.mutate({
                                id: family.id
                              });
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
            </div>
          )}
      </div>

      {
        selectedFamily && (
          <EditFamilyModal
            selectedFamily={selectedFamily}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            users={users}
          />
        )
      }
    </section>
  )

}

export default ManageFamilies;