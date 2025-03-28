import ScheduleMessage from "~/components/schedule/scheduleMessage";
import ManageUpcomingMessages from "~/components/schedule/manageUpcomingMessages";
import { api } from "~/utils/api";
import Error from "next/error";
import Layout from "~/layouts/layout";

const ScheduleMessagePage = () => {
  const { data: users, isLoading: isLoadingUsers, error } = api.user.getAllUsers.useQuery();

  const { data: emailMessages, isLoading: loadingEmails } = api.futureEmail.getAllUpcomingEmailMessages.useQuery();
  const { data: smsMessages, isLoading: loadingSMS } = api.futureSMS.getAllUpcomingSMSMessages.useQuery();

  const isLoadingMessages = loadingEmails || loadingSMS;

  if (error) {
    return <Error
      statusCode={
        error?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="h-full w-full rounded-2xl flex flex-row gap-4">
        <section className="grow bg-white h-full rounded-xl flex flex-col gap-8 p-8 min-w-96 overflow-hidden">
          <ScheduleMessage users={users || []} isLoading={isLoadingUsers} />
        </section>

        <section
          className="bg-white h-full rounded-xl p-8 flex flex-col min-w-96 w-1/4 overflow-hidden"
        >
          <ManageUpcomingMessages
            emailMessages={emailMessages || []}
            smsMessages={smsMessages || []}
            users={users || []}
            isLoading={isLoadingMessages}
          />
        </section>
      </main>
    );
  }
}

ScheduleMessagePage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default ScheduleMessagePage;