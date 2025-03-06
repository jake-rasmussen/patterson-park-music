import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { USER_TYPE, ENROLLMENT_STATUS, CAMPUS, SEMESTER, COURSE, WEEKDAY } from "@prisma/client";
import { db } from "~/server/db";
import { enrollmentRouter } from "./enrollment";

export const bulkRouter = createTRPCRouter({
  getFilteredUsers: publicProcedure
    .input(
      z.object({
        userType: z.nativeEnum(USER_TYPE).array(),
        enrollmentStatus: z.nativeEnum(ENROLLMENT_STATUS).array(),
        location: z.nativeEnum(CAMPUS).array(),
        semester: z.nativeEnum(SEMESTER).array(),
        course: z.nativeEnum(COURSE).array(),
        weekday: z.nativeEnum(WEEKDAY).array(),
        teacherId: z.string().array(),
      })
    )
    .query(async ({ input }) => {
      // If no filters (besides userType) are selected, return an empty array.
      if (
        input.userType.length === 0 &&
        input.enrollmentStatus.length === 0 &&
        input.location.length === 0 &&
        input.semester.length === 0 &&
        input.course.length === 0 &&
        input.weekday.length === 0 &&
        input.teacherId.length === 0
      ) {
        return [];
      }

      // Build an array of AND conditions for all parameters (except userType)
      const andConditions: any[] = [];

      if (input.location.length > 0) {
        andConditions.push({
          OR: [
            { school: { in: input.location } },
            { family: { campus: { in: input.location } } },
            { section: { some: { campus: { in: input.location } } } },
            { enrollment: { some: { section: { campus: { in: input.location } } } } },
            {
              family: {
                users: {
                  some: {
                    type: USER_TYPE.STUDENT,
                    enrollment: { some: { section: { campus: { in: input.location } } } },
                  },
                },
              },
            },
          ],
        });
      }

      if (input.enrollmentStatus.length > 0) {
        andConditions.push({
          OR: [
            {
              type: USER_TYPE.STUDENT,
              enrollment: { some: { status: { in: input.enrollmentStatus } } },
            },
            {
              type: USER_TYPE.PARENT,
              family: {
                users: {
                  some: {
                    type: USER_TYPE.STUDENT,
                    enrollment: { some: { status: { in: input.enrollmentStatus } } },
                  },
                },
              },
            },
          ],
        });
      }

      if (input.semester.length > 0) {
        andConditions.push({
          OR: [
            { enrollment: { some: { section: { semesters: { hasSome: input.semester } } } } },
            {
              family: {
                users: {
                  some: {
                    type: USER_TYPE.STUDENT,
                    enrollment: { some: { section: { semesters: { hasSome: input.semester } } } },
                  },
                },
              },
            },
            { section: { some: { semesters: { hasSome: input.semester } } } },
          ],
        });
      }

      if (input.course.length > 0) {
        andConditions.push({
          OR: [
            { enrollment: { some: { section: { course: { in: input.course } } } } },
            {
              family: {
                users: {
                  some: {
                    type: USER_TYPE.STUDENT,
                    enrollment: { some: { section: { course: { in: input.course } } } },
                  },
                },
              },
            },
            { section: { some: { course: { in: input.course } } } },
          ],
        });
      }

      if (input.weekday.length > 0) {
        andConditions.push({
          OR: [
            { enrollment: { some: { section: { weekdays: { hasSome: input.weekday } } } } },
            {
              family: {
                users: {
                  some: {
                    type: USER_TYPE.STUDENT,
                    enrollment: { some: { section: { weekdays: { hasSome: input.weekday } } } },
                  },
                },
              },
            },
            { section: { some: { weekdays: { hasSome: input.weekday } } } },
          ],
        });
      }

      if (input.teacherId.length > 0) {
        andConditions.push({
          OR: [
            { enrollment: { some: { section: { teacherId: { in: input.teacherId } } } } },
            {
              family: {
                users: {
                  some: {
                    type: USER_TYPE.STUDENT,
                    enrollment: { some: { section: { teacherId: { in: input.teacherId } } } },
                  },
                },
              },
            },
            { section: { some: { teacherId: { in: input.teacherId } } } },
          ],
        });
      }

      // Build the final where clause.
      // The userType filter is applied globally, and all other filters (if any) must all be satisfied.
      const whereClause: any = {
        ...(input.userType.length > 0 && { type: { in: input.userType } }),
        ...(andConditions.length > 0 && { AND: andConditions }),
      };

      console.log("WHERE CLAUSE", JSON.stringify(whereClause, null, 2));

      const usersResult = await db.user.findMany({
        where: whereClause,
        include: {
          enrollment: { include: { section: true } },
          section: true,
          family: {
            include: {
              users: { include: { enrollment: { include: { section: true } } } },
            },
          },
        },
      });

      return usersResult;
    }),
});
