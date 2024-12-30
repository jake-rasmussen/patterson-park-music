import CreateSection from "~/components/section/createSection";
import SectionTable from "~/components/section/sectionTable";
import { api } from "~/utils/api";
import Error from "next/error";

export default function SectionPage() {
  const { data: teachers = [], isLoading: isLoadingTeachers, error: errorTeachers } = api.user.getAllTeachers.useQuery();
  const { data: sections, isLoading: isLoadingSections, error: errorSections } = api.section.getAllSections.useQuery();

  if (errorTeachers || errorSections) {
    return <Error
      statusCode={
        errorSections?.data?.httpStatus || errorTeachers?.data?.httpStatus ||
        500
      }
    />
  }

  return (
    <main className="flex flex-row gap-8 h-full">
      <section className="grow bg-white h-full rounded-xl flex flex-col gap-8 p-8">
        <SectionTable
          sections={sections || []}
          teachers={teachers || []}
          isLoading={isLoadingTeachers || isLoadingSections}
        />
      </section>

      <div className="flex flex-col gap-8">
        <section className="bg-white rounded-xl h-fit flex flex-col gap-8 p-8 min-w-96">
          <CreateSection teachers={teachers} />
        </section>
      </div>
    </main>
  );
}
