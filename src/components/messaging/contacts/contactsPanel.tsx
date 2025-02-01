import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input, Spinner, Tab, Tabs } from "@nextui-org/react";
import { Family, User } from "@prisma/client";
import { IconSearch } from "@tabler/icons-react";
import ContactCard from "./contactCard";
import SelectedContactView from "./selectedContactView";
import { api } from "~/utils/api";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type PropType = {
  users: (User & { family: Family | null })[];
  isLoading: boolean;
  selectedUser?: User & { family: Family | null };
  setSelectedUser: Dispatch<SetStateAction<User & { family: Family | null } | undefined>>;
};

const ContactsPanel = ({ users: initialUsers, isLoading, selectedUser, setSelectedUser }: PropType) => {
  const [users, setUsers] = useState(initialUsers || []);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: searchedUsers, isFetching } = api.user.searchUsers.useQuery(
    { query: debouncedSearchQuery },
    { enabled: !!debouncedSearchQuery || searchQuery.length === 0 }
  );

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

  useEffect(() => {
    setUsers(searchedUsers || initialUsers || []);
  }, [searchedUsers, initialUsers]);

  const sortUsers = (userList: (User & { family: Family | null })[]) => {
    return userList.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      if (a.unreadMessage !== b.unreadMessage) return b.unreadMessage ? 1 : -1;
      return a.firstName.localeCompare(b.firstName);
    });
  };

  const updateUserState = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
  };

  const inboxUsers = sortUsers(users.filter((user) => !user.isArchived));
  const archivedUsers = sortUsers(users.filter((user) => user.isArchived));

  return (
    <div className="h-full overflow-hidden px-4 w-full">
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner label="Loading..." className="m-auto" />
        </div>
      ) : selectedUser ? (
        <SelectedContactView users={users} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      ) : (
        <div className="flex flex-col gap-2 items-center h-full w-full">
          <Tabs className="mt-8">
            <Tab key="inbox" title="Inbox" className="flex flex-col gap-2">
              <Input
                isClearable
                className="w-full"
                placeholder="Search"
                startContent={<IconSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => {
                  setSearchQuery("");
                }}
              />
              {isFetching ? (
                <Spinner label="Loading..." className="m-auto py-4" />
              ) : inboxUsers.length > 0 ? (
                inboxUsers.map((user) => (
                  <ContactCard key={user.id} user={user} setSelectedUser={setSelectedUser} updateUserState={updateUserState} />
                ))
              ) : (
                <p className="text-gray-500 py-4 text-center">No contacts found.</p>
              )}
            </Tab>
            <Tab key="archived" title="Archived" className="flex flex-col gap-2">
              <Input
                isClearable
                className="w-full"
                placeholder="Search"
                startContent={<IconSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => {
                  setSearchQuery("");
                }}
              />
              {isFetching ? (
                <Spinner label="Loading..." className="m-auto py-4" />
              ) : archivedUsers.length > 0 ? (
                archivedUsers.map((user) => (
                  <ContactCard key={user.id} user={user} setSelectedUser={setSelectedUser} updateUserState={updateUserState} />
                ))
              ) : (
                <p className="text-gray-500 py-4 text-center">No contacts found.</p>
              )}
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ContactsPanel;
