import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TAG } from "@prisma/client";

export const tagPersonRouter = createTRPCRouter({
  createTagPerson: protectedProcedure
    .input(z.object({
      tag: z.nativeEnum(TAG),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.tagPerson.create({
        data: { tag: input.tag },
      });
    }),

  getAllTagPersons: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.tagPerson.findMany();
  }),

  getTagPersonById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.tagPerson.findUnique({
        where: { id: input },
      });
    }),

  updateTagPerson: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        tag: z.nativeEnum(TAG).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      return await ctx.db.tagPerson.update({
        where: { id },
        data,
      });
    }),
});
