import ScheduleMessage from "~/components/schedule/scheduleMessage";
import UpcomingMessages from "~/components/schedule/upcomingMessages";

export default function ScheduleMessagePage() {
  return (
    <main className="h-full w-full rounded-2xl flex flex-row gap-4">
      <section className="grow bg-white h-full rounded-xl overflow-auto flex flex-col gap-8 p-8">
        <ScheduleMessage />
      </section>

      <section
        className="bg-white h-full rounded-xl overflow-auto p-8 gap-8 flex flex-col min-w-96"
      >
        <UpcomingMessages />
      </section>
    </main>
  );
}