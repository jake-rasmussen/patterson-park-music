import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const familyRouter = createTRPCRouter({
  createFamily: publicProcedure
    .input(z.object({
      doorCode: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.family.create({
        data: { doorCode: input.doorCode },
      });
    }),

  getAllFamilies: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.family.findMany();
  }),

  getFamilyById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.family.findUnique({
        where: { id: input },
      });
    }),

  updateFamily: publicProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        doorCode: z.string().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      return await ctx.db.family.update({
        where: { id },
        data,
      });
    }),
});
