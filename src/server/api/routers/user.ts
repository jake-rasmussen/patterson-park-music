import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  // Procedure to create a new user
  createUser: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(), // Optional as per the schema
        phoneNumber: z.string(),
        isTeacher: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, phoneNumber, isTeacher } = input;

      try {
        const newUser = await ctx.db.user.create({
          data: {
            firstName,
            lastName,
            email,
            phoneNumber: "+1" + phoneNumber,
            isTeacher
          },
        });
        return { success: true, user: newUser };
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    }),

  // Procedure to update an existing user
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, firstName, lastName, email, phoneNumber } = input;

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id },
          data: {
            firstName,
            lastName,
            phoneNumber: "+1" + phoneNumber,
            email
          },
        });
        return { success: true, user: updatedUser };
      } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
      }
    }),

  // Procedure to get all users
  getAllUsers: publicProcedure
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

  getAllTeachers: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const users = await ctx.db.user.findMany({
          where: {
            isTeacher: true
          }
        });

        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }),
  getAllStudents: publicProcedure
    .query(async ({ ctx}) => {
      try {
        const users = await ctx.db.user.findMany({
          where: {
            isTeacher: false
          }
        });

        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }),

  // Procedure to get a user by email or phone number
  getUserByEmailOrPhone: publicProcedure
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
  deleteUser: publicProcedure
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
