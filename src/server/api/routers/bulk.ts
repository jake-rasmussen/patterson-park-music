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
      })
    )
    .query(async ({ input }) => {
      console.log("INPUT:", input);

      // If no filters are selected, return an empty array
      if (
        input.userType.length === 0 &&
        input.enrollmentStatus.length === 0 &&
        input.location.length === 0 &&
        input.semester.length === 0 &&
        input.course.length === 0 &&
        input.weekday.length === 0
      ) {
        return [];
      }

      const users = await db.user.findMany({
        where: {
          // User Type Filtering
          ...(input.userType.length > 0 && { type: { in: input.userType } }),

          // Location Filtering
          ...(input.location.length > 0 && {
            OR: [
              { school: { in: input.location } },
              { family: { campus: { in: input.location } } },
              { section: { some: { campus: { in: input.location } } } },
              {
                enrollment: {
                  some: {
                    section: { campus: { in: input.location } },
                  },
                },
              },
              {
                family: {
                  users: {
                    some: {
                      type: USER_TYPE.STUDENT,
                      enrollment: {
                        some: {
                          section: { campus: { in: input.location } },
                        },
                      },
                    },
                  },
                },
              },
            ],
          }),

          // Role-Specific Filtering (only applied if applicable filters are provided)
          AND: [
            {
              OR: [
                // 🎓 Students: Must Match Enrollment & Additional Filters
                input.userType.includes(USER_TYPE.STUDENT)
                  ? {
                    type: USER_TYPE.STUDENT,
                    ...(input.enrollmentStatus.length > 0 ||
                      input.semester.length > 0 ||
                      input.course.length > 0 ||
                      input.weekday.length > 0
                      ? {
                        enrollment: {
                          some: {
                            AND: [
                              ...(input.enrollmentStatus.length > 0
                                ? [{ status: { in: input.enrollmentStatus } }]
                                : []),
                              ...(input.semester.length > 0
                                ? [{ section: { semesters: { hasSome: input.semester } } }]
                                : []),
                              ...(input.course.length > 0
                                ? [{ section: { course: { in: input.course } } }]
                                : []),
                              ...(input.weekday.length > 0
                                ? [{ section: { weekdays: { hasSome: input.weekday } } }]
                                : []),
                            ],
                          },
                        },
                      }
                      : {}),
                  }
                  : {},

                // 👨‍👩‍👧 Parents: Must Have a Student in Their Family Matching Filters
                input.userType.includes(USER_TYPE.PARENT)
                  ? {
                    type: USER_TYPE.PARENT,
                    family: {
                      users: {
                        some: {
                          type: USER_TYPE.STUDENT,
                          AND: [
                            {
                              enrollment: {
                                some: {
                                  AND: [
                                    ...(input.enrollmentStatus.length > 0
                                      ? [{ status: { in: input.enrollmentStatus } }]
                                      : []),
                                    ...(input.semester.length > 0
                                      ? [{ section: { semesters: { hasSome: input.semester } } }]
                                      : []),
                                    ...(input.course.length > 0
                                      ? [{ section: { course: { in: input.course } } }]
                                      : []),
                                    ...(input.weekday.length > 0
                                      ? [{ section: { weekdays: { hasSome: input.weekday } } }]
                                      : []),
                                  ],
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  }
                  : {},

                // 🧑‍🏫 Teachers: Must Match Section Filters, Excluding Enrollment Status
                input.userType.includes(USER_TYPE.TEACHER) &&
                  input.enrollmentStatus.length === 0 &&
                  (input.semester.length > 0 || input.course.length > 0 || input.weekday.length > 0)
                  ? {
                    type: USER_TYPE.TEACHER,
                    section: {
                      some: {
                        AND: [
                          ...(input.semester.length > 0
                            ? [{ semesters: { hasSome: input.semester } }]
                            : []),
                          ...(input.course.length > 0
                            ? [{ course: { in: input.course } }]
                            : []),
                          ...(input.weekday.length > 0
                            ? [{ weekdays: { hasSome: input.weekday } }]
                            : []),
                        ],
                      },
                    },
                  }
                  : {},
              ],
            },
          ],
        },

        include: {
          enrollment: {
            include: {
              section: true,
            },
          },
          section: true,
          family: {
            include: {
              users: {
                include: {
                  enrollment: {
                    include: {
                      section: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return users;
    }),
});
