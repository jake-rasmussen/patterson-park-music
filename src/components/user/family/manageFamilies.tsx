import { Button } from "@heroui/button";
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Divider, Spinner, Input } from "@heroui/react";
import { Family, User } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
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
  const [selectedFamily, setSelectedFamily] = useState<(Family & { users: User[] })>();
  const [query, setQuery] = useState("");

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

  const filteredFamilies = query.trim().length > 0
    ? families.filter((family) =>
      family.familyName.toLowerCase().includes(query.toLowerCase())
    )
    : families;

  return (
    <section className="flex flex-col items-center w-full h-full justify-center">
      <h2 className="text-xl text-center">Family List</h2>
      <Divider className="mt-4" />

      <div className="w-full flex flex-row justify-center items-center my-4">
        <Input
          isClearable
          className="max-w-xs"
          placeholder="Search by family name"
          startContent={<IconSearch />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onClear={() => setQuery("")}
        />
      </div>

      <Divider />
      <div className="h-full w-full overflow-y-auto">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." className="m-auto" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full overflow-y-scroll p-4">
            {filteredFamilies?.map((family: (Family & { users: User[] })) => (
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
                        onPress={() => {
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
                        onPress={() => {
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
            ))}
          </div>
        )}
      </div>

      {selectedFamily && (
        <EditFamilyModal
          selectedFamily={selectedFamily}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          users={users}
        />
      )}
    </section>
  );
};

export default ManageFamilies;
