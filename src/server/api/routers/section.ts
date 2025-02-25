import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { COURSE, WEEKDAY, SEMESTER, CAMPUS } from "@prisma/client";

export const sectionRouter = createTRPCRouter({
  createSection: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        course: z.nativeEnum(COURSE),
        semesters: z.array(z.nativeEnum(SEMESTER)),
        weekdays: z.array(z.nativeEnum(WEEKDAY)),
        campus: z.nativeEnum(CAMPUS),
        startTime: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.section.create({
        data: input,
      });
    }),
  getAllSections: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.section.findMany({
      include: {
        teacher: true, // Optional: Include teacher details if needed
        enrollment: true, // Optional: Include enrollment details if needed
      },
    });
  }),
  getSectionById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.section.findUnique({
        where: { id: input },
        include: {
          teacher: true, // Optional: Include teacher details if needed
          enrollment: true, // Optional: Include enrollment details if needed
        },
      });
    }),
  getSectionByTeacherId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.section.findMany({
        where: { teacherId: input },
      });
    }),
  updateSection: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        course: z.nativeEnum(COURSE).optional(),
        semesters: z.array(z.nativeEnum(SEMESTER)).optional(),
        weekdays: z.array(z.nativeEnum(WEEKDAY)).optional(),
        campus: z.nativeEnum(CAMPUS).optional(),
        startTime: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, course, semesters, weekdays, campus, startTime } = input;

      return await ctx.db.section.update({
        where: { id },
        data: {
          course,
          semesters,
          weekdays,
          campus,
          startTime
        },
      });
    }),
  deleteSection: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await ctx.db.enrollment.deleteMany({
        where: {
          sectionId: id,
        },
      });

      return await ctx.db.section.delete({
        where: {
          id
        }
      })
    }),
  getSectionsByIds: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.section.findMany({
        where: { id: { in: input.ids } },
        include: {
          teacher: true
        }
      });
    }),
});
