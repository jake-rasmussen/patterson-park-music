import CreateSectionModal from "~/components/section/createSectionModal";
import ManageSections from "~/components/section/manageSections";
import { api } from "~/utils/api";
import Error from "next/error";
import Layout from "~/layouts/layout";

const SectionPage = () => {
  const { data: teachers = [], isLoading: isLoadingTeachers, error: errorTeachers } = api.user.getAllTeachers.useQuery();
  const { data: sections, isLoading: isLoadingSections, error: errorSections } = api.section.getAllSections.useQuery();

  if (errorTeachers || errorSections) {
    return <Error
      statusCode={
        errorSections?.data?.httpStatus || errorTeachers?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="flex flex-row gap-8 h-full">
        <section className="grow bg-white rounded-xl h-full overflow-auto min-w-96">
          <ManageSections
            sections={sections || []}
            teachers={teachers || []}
            isLoading={isLoadingTeachers || isLoadingSections}
          />
        </section>
      </main>
    );
  }
}

SectionPage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default SectionPage;