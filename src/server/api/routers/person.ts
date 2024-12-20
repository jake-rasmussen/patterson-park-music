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
});
