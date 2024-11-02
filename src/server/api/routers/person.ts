import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const personRouter = createTRPCRouter({
  createPerson: publicProcedure
    .input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phoneNumber: z.string(),
      userName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.person.create({
        data: input,
      });
    }),

  getAllPersons: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.person.findMany();
  }),

  getPersonById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.person.findUnique({
        where: { id: input },
      });
    }),

  updatePerson: publicProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      return await ctx.db.person.update({
        where: { id },
        data,
      });
    }),
});
