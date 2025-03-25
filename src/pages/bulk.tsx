import Layout from "~/layouts/layout";
import CreateBulkMessage from "~/components/bulk/createBulkMessage";

const BulkMessagePage = () => {
  return (
    <main className="h-full w-full rounded-2xl flex flex-row gap-4">
      <section className="grow bg-white h-full rounded-xl overflow-auto flex flex-col gap-8 p-8 min-w-96">
        <CreateBulkMessage />
      </section>
    </main>
  );
}

BulkMessagePage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default BulkMessagePage;