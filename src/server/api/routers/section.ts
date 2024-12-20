import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { COURSE, WEEKDAY } from "@prisma/client";

export const sectionRouter = createTRPCRouter({
  createSection: publicProcedure
    .input(z.object({
      teacherId: z.string(),
      course: z.nativeEnum(COURSE),
      semester: z.string(),
      weekday: z.nativeEnum(WEEKDAY),
      startTime: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.section.create({
        data: input,
      });
    }),

  getAllSections: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.section.findMany();
  }),

  getSectionById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.section.findUnique({
        where: { id: input },
      });
    }),

  updateSection: publicProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        semester: z.string().optional(),
        weekday: z.nativeEnum(WEEKDAY).optional(),
        startTime: z.date().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      return await ctx.db.section.update({
        where: { id },
        data,
      });
    }),
});
