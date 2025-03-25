import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient, CAMPUS, COURSE, SEMESTER, WEEKDAY, ENROLLMENT_STATUS } from "@prisma/client";

const prisma = new PrismaClient();

// Resolve __dirname in an ES module context.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the correct filename.
const fileName = "migrations.xlsx";
const filePath = path.join(__dirname, fileName);

// Utility function to read a sheet with type safety.
function readSheet<T>(workbook: xlsx.WorkBook, sheetName: string): T[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet ${sheetName} not found in the workbook.`);
  }
  return xlsx.utils.sheet_to_json(sheet) as T[];
}

// Interfaces for each migration sheet based on file columns.
interface ParMigrationRow {
  ParID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: string; // should be "PARENT"
  familyId: number | string;  // provided as an integer in the XLSX file
  doorCode: number | string;  // provided as an integer; will be converted to string
  campus: keyof typeof CAMPUS;
}

interface StuMigrationRow {
  FamId: number | string;  // provided as an integer in the XLSX file
  StuID: string;
  firstName: string;
  lastName: string;
  birthday: string | number;
  type: string; // should be "STUDENT"
}

interface FacMigrationRow {
  FacId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: string; // should be "TEACHER"
}

interface SectionRow {
  SectionId: string;
  Weekday: string; // may be comma-separated if multiple
  CampusID: keyof typeof CAMPUS;
  ClassStart: string | number; // Could be a string or an Excel date number.
  FacID: string;  // old teacher id from FacMigration
  course: keyof typeof COURSE;
}

interface EnrollmentRow {
  StuID: string;
  SectionId: string;
  startDate: string | number;
  endDate: string | number;
  status: keyof typeof ENROLLMENT_STATUS;
}

// Mapping objects for foreign key relationships.
// familyMap: maps the original family id (converted to string) to the new Family.id
const familyMap: Record<string, string> = {};
// userMap: maps old user ids (from ParID, StuID, FacId) to the new User.id
const userMap: Record<string, string> = {};
// sectionMap: maps old section ids to the new Section.id
const sectionMap: Record<string, string> = {};

// Clear the database before migration.
async function clearDB(): Promise<void> {
  console.log("Clearing database...");
  // Delete child records first to satisfy foreign key constraints.
  await prisma.enrollment.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.family.deleteMany({});
  console.log("Database cleared.");
}

// Helper function to convert Excel date (number) or string to a valid Date.
function parseExcelDate(value: string | number): Date {
  if (typeof value === "number") {
    // Excel dates: days since 1899-12-30. (Note: Excel incorrectly treats 1900 as a leap year.)
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  } else {
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }
    return d;
  }
}

// Migrate parents from the ParMigration sheet.
async function migrateParMigration(workbook: xlsx.WorkBook): Promise<void> {
  const rows = readSheet<ParMigrationRow>(workbook, "ParMigration");
  for (const row of rows) {
    // If we've already processed this parent, skip.
    if (userMap[row.ParID]) continue;
    
    // Convert familyId to string so we can use it as a key.
    const familyKey = String(row.familyId);
    // Create or reuse the Family record.
    let familyDbId = familyMap[familyKey];
    if (!familyDbId) {
      const family = await prisma.family.create({
        data: {
          // Use the parent's last name as the family name.
          familyName: row.lastName,
          campus: row.campus,
          doorCode: String(row.doorCode),
        },
      });
      familyDbId = family.id;
      familyMap[familyKey] = familyDbId;
    }
    // Create the parent user.
    const parent = await prisma.user.create({
      data: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phoneNumber: row.phoneNumber ? row.phoneNumber : undefined,
        type: "PARENT",
        familyId: familyDbId,
      },
    });
    userMap[row.ParID] = parent.id;
  }
}

// Migrate students from the StuMigration sheet.
async function migrateStuMigration(workbook: xlsx.WorkBook): Promise<void> {
  const rows = readSheet<StuMigrationRow>(workbook, "StuMigration");
  for (const row of rows) {
    if (userMap[row.StuID]) continue; // Skip if already inserted.
    
    // Convert FamId to string.
    const familyKey = String(row.FamId);
    // Find or create the Family record.
    let familyDbId = familyMap[familyKey];
    if (!familyDbId) {
      const family = await prisma.family.create({
        data: {
          // Use the student's last name as the family name.
          familyName: row.lastName,
          campus: "PPAM", // default campus; adjust if needed
          doorCode: "",   // default doorCode
        },
      });
      familyDbId = family.id;
      familyMap[familyKey] = familyDbId;
    }
    // Create the student user.
    const student = await prisma.user.create({
      data: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: null, // no email provided in StuMigration
        // Omit phoneNumber if not provided.
        type: "STUDENT",
        familyId: familyDbId,
        birthday: parseExcelDate(row.birthday),
      },
    });
    userMap[row.StuID] = student.id;
  }
}

// Migrate teachers from the FacMigration sheet.
async function migrateFacMigration(workbook: xlsx.WorkBook): Promise<void> {
  const rows = readSheet<FacMigrationRow>(workbook, "FacMigration");
  for (const row of rows) {
    if (userMap[row.FacId]) continue; // Skip duplicate.
    const teacher = await prisma.user.create({
      data: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phoneNumber: row.phoneNumber ? row.phoneNumber : undefined,
        type: "TEACHER",
      },
    });
    userMap[row.FacId] = teacher.id;
  }
}

// Migrate sections.
async function migrateSections(workbook: xlsx.WorkBook): Promise<void> {
  const rows = readSheet<SectionRow>(workbook, "Sections");
  for (const row of rows) {
    if (sectionMap[row.SectionId]) continue; // Skip duplicate section.
    
    const teacherId = userMap[row.FacID];
    if (!teacherId) {
      console.warn(`Teacher with old id ${row.FacID} not found.`);
      continue;
    }
    // Process weekdays by converting each to uppercase.
    const weekdays = row.Weekday.split(",").map(s => s.trim().toUpperCase()) as (keyof typeof WEEKDAY)[];
    // Since semesters are not provided, default to an empty array.
    const semesters: (keyof typeof SEMESTER)[] = [];
    // Convert ClassStart to a Date, handling Excel date numbers if needed.
    const startTime = parseExcelDate(row.ClassStart);
    
    const section = await prisma.section.create({
      data: {
        teacherId: teacherId,
        course: row.course,
        semesters: semesters,
        weekdays: weekdays,
        campus: row.CampusID,
        startTime: startTime,
      },
    });
    sectionMap[row.SectionId] = section.id;
  }
}

// Migrate enrollments.
async function migrateEnrollments(workbook: xlsx.WorkBook): Promise<void> {
  const rows = readSheet<EnrollmentRow>(workbook, "Enrollment");
  for (const row of rows) {
    const sectionId = sectionMap[row.SectionId];
    if (!sectionId) {
      console.warn(`Section with old id ${row.SectionId} not found.`);
      continue;
    }
    const userId = userMap[row.StuID];
    if (!userId) {
      console.warn(`Student with old id ${row.StuID} not found.`);
      continue;
    }
    await prisma.enrollment.create({
      data: {
        sectionId: sectionId,
        userId: userId,
        startDate: parseExcelDate(row.startDate),
        endDate: parseExcelDate(row.endDate),
        status: row.status,
      },
    });
  }
}

// Run the migration in order.
async function runMigration(): Promise<void> {
  try {
    const workbook = xlsx.readFile(filePath);
    console.log("Sheets in workbook:", workbook.SheetNames);
    await clearDB();
    await migrateParMigration(workbook);
    await migrateStuMigration(workbook);
    await migrateFacMigration(workbook);
    await migrateSections(workbook);
    await migrateEnrollments(workbook);
    console.log("Data migration completed successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
