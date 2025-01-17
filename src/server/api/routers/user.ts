import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { USER_TYPE } from "@prisma/client";

export const userRouter = createTRPCRouter({
  createUser: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(), // Optional as per the schema
        phoneNumber: z.string().length(10, "Enter a valid phone number"),
        type: z.enum(Object.values(USER_TYPE) as [USER_TYPE, ...USER_TYPE[]]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, phoneNumber, type } = input;

      try {
        const newUser = await ctx.db.user.create({
          data: {
            firstName,
            lastName,
            email,
            phoneNumber: "+1" + phoneNumber,
            type,
          },
        });
        return { success: true, user: newUser };
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        type: z.enum(Object.values(USER_TYPE) as [USER_TYPE, ...USER_TYPE[]]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, firstName, lastName, email, phoneNumber, type } = input;

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id },
          data: {
            firstName,
            lastName,
            phoneNumber: phoneNumber ? "+1" + phoneNumber : undefined,
            email,
            type,
          },
        });
        return { success: true, user: updatedUser };
      } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
      }
    }),
  getAllUsers: protectedProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        take: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { skip, take } = input || {};

      try {
        const users = await ctx.db.user.findMany({
          skip,
          take,
          orderBy: { lastName: "asc" },
        });

        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to retrieve users");
      }
    }),
  getAllTeachers: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const users = await ctx.db.user.findMany({
          where: {
            type: USER_TYPE.TEACHER
          }
        });

        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }),
  getAllStudents: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const users = await ctx.db.user.findMany({
          where: {
            type: USER_TYPE.STUDENT
          }
        });

        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }),
  getUserByEmailOrPhone: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
      }).refine(
        (data) => data.email || data.phoneNumber,
        { message: "Either email or phone number must be provided" }
      )
    )
    .query(async ({ ctx, input }) => {
      const { email, phoneNumber } = input;

      try {
        const user = await ctx.db.user.findFirst({
          where: {
            OR: [
              { email: email || undefined },
              { phoneNumber: phoneNumber || undefined },
            ],
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to retrieve user");
      }
    }),
  deleteUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      return await ctx.db.user.delete({
        where: {
          id
        }
      })
    })
});
