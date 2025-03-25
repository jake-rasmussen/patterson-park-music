import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Accordion, AccordionItem, Input, Spinner, Tab, Tabs } from "@heroui/react";
import { Enrollment, Family, User } from "@prisma/client";
import { IconSearch, IconUserX } from "@tabler/icons-react";
import ContactCard from "./contactCard";
import SelectedContactView from "./selectedContactView";
import { api } from "~/utils/api";
import type { Selection } from "@heroui/react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type PropType = {
  selectedUser?: User & { family: Family | null; enrollment: Enrollment[] };
  setSelectedUser: Dispatch<
    SetStateAction<User & { family: Family | null; enrollment: Enrollment[] } | undefined>
  >;
};

const ContactsPanel = ({ selectedUser, setSelectedUser }: PropType) => {
  const [users, setUsers] = useState<(User &
  { family: Family | null; enrollment: Enrollment[] }
  )[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["1"]));

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const { data: queriedUsers, isFetching } = api.user.searchUsers.useQuery(
    { query: debouncedSearchQuery },
    { enabled: true }
  );

  useEffect(() => {
    if (queriedUsers) {
      setUsers(queriedUsers.filter(user => user.phoneNumber || user.email));
    } else {
      setUsers([]);
    }
  }, [queriedUsers]);

  api.supabase.onUnreadMessage.useSubscription(undefined, {
    onData: (updatedUser) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
    },
    onError: (error) => console.error("Subscription error:", error),
  });

  const inboxUsers = useMemo(() => users.filter(user => !user.isArchived), [users]);
  const archivedUsers = useMemo(() => users.filter(user => user.isArchived), [users]);

  const displayUser = (user: User) => user.hasMessage || user.isPinned;

  const inboxWithMessages = useMemo(() => inboxUsers.filter(displayUser), [inboxUsers]);
  const inboxWithoutMessages = useMemo(() => inboxUsers.filter(user => !displayUser(user)), [inboxUsers]);
  const archivedWithMessages = useMemo(() => archivedUsers.filter(displayUser), [archivedUsers]);
  const archivedWithoutMessages = useMemo(() => archivedUsers.filter(user => !displayUser(user)), [archivedUsers]);

  const sortUsers = (userList: (User & { family: Family | null; enrollment: Enrollment[] })[]) => {
    return userList.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      if (a.unreadMessage !== b.unreadMessage) return b.unreadMessage ? 1 : -1;
      return a.firstName.localeCompare(b.firstName);
    });
  };

  const sortedInboxWithMessages = sortUsers(inboxWithMessages);
  const sortedInboxWithoutMessages = sortUsers(inboxWithoutMessages);
  const sortedArchivedWithMessages = sortUsers(archivedWithMessages);
  const sortedArchivedWithoutMessages = sortUsers(archivedWithoutMessages);

  const updateUserState = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map(user =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
  };

  return (
    <div className="h-full px-4 w-full">
      {selectedUser ? (
        <SelectedContactView
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      ) : (
        <div className="flex flex-col gap-2 items-center h-full w-full">
          <Tabs className="mt-8 w-52" fullWidth>
            <Tab key="inbox" title="Inbox" className="flex flex-col items-center overflow-y-auto">
              <Input
                isClearable
                className="w-full mb-4 w-60"
                placeholder="Search"
                startContent={<IconSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
              {isFetching ? (
                <Spinner label="Loading..." className="m-auto py-4" />
              ) : (
                <div className="overflow-y-scroll">
                  {sortedInboxWithMessages.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {sortedInboxWithMessages.map(user => (
                        <ContactCard
                          key={user.id}
                          user={user}
                          setSelectedUser={setSelectedUser}
                          updateUserState={updateUserState}
                        />
                      ))}
                    </div>
                  )}
                  {sortedInboxWithoutMessages.length > 0 && (
                    <Accordion
                      className="w-64"
                      selectedKeys={selectedKeys}
                      onSelectionChange={setSelectedKeys}
                    >
                      <AccordionItem title="All Users" subtitle="Click to view all users">
                        {sortedInboxWithoutMessages.map(user => (
                          <ContactCard
                            key={user.id}
                            user={user}
                            setSelectedUser={setSelectedUser}
                            updateUserState={updateUserState}
                          />
                        ))}
                      </AccordionItem>
                    </Accordion>
                  )}
                  {(sortedInboxWithMessages.length === 0 && sortedInboxWithoutMessages.length === 0) && (
                    <div className="flex flex-col items-center">
                      <IconUserX className="w-20 h-20 text-secondary" />
                      <p>No users found.</p>
                    </div>
                  )}
                </div>
              )}
            </Tab>
            <Tab key="archived" title="Archived" className="flex flex-col items-center overflow-y-auto">
              <Input
                isClearable
                className="w-full mb-4 w-60"
                placeholder="Search"
                startContent={<IconSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
              {isFetching ? (
                <Spinner label="Loading..." className="m-auto py-4" />
              ) : (
                <div className="overflow-y-scroll">
                  {sortedArchivedWithMessages.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {sortedArchivedWithMessages.map(user => (
                        <ContactCard
                          key={user.id}
                          user={user}
                          setSelectedUser={setSelectedUser}
                          updateUserState={updateUserState}
                        />
                      ))}
                    </div>
                  )}

                  {sortedArchivedWithoutMessages.length > 0 && (
                    <Accordion
                      className="w-64"
                      selectedKeys={selectedKeys}
                      onSelectionChange={setSelectedKeys}
                    >
                      <AccordionItem title="All Users" subtitle="Click to view all users">
                        {sortedArchivedWithoutMessages.map(user => (
                          <ContactCard
                            key={user.id}
                            user={user}
                            setSelectedUser={setSelectedUser}
                            updateUserState={updateUserState}
                          />
                        ))}
                      </AccordionItem>
                    </Accordion>
                  )}

                  {(sortedArchivedWithMessages.length === 0 && sortedArchivedWithoutMessages.length === 0) && (
                    <div className="flex flex-col items-center">
                      <IconUserX className="w-20 h-20 text-secondary" />
                      <p>No users found.</p>
                    </div>
                  )}
                </div>
              )}
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ContactsPanel;
