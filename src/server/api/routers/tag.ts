import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TAG } from "@prisma/client";

export const tagPersonRouter = createTRPCRouter({
  createTagPerson: publicProcedure
    .input(z.object({
      tag: z.nativeEnum(TAG),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.tagPerson.create({
        data: { tag: input.tag },
      });
    }),

  getAllTagPersons: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.tagPerson.findMany();
  }),

  getTagPersonById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.tagPerson.findUnique({
        where: { id: input },
      });
    }),

  updateTagPerson: publicProcedure
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
