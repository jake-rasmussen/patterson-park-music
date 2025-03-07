import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CAMPUS, COURSE, USER_TYPE } from "@prisma/client";
import { createClient } from "~/utils/supabase/client/component";

export const userRouter = createTRPCRouter({
  createUser: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(), // Optional as per the schema
        phoneNumber: z.string().length(10, "Enter a valid phone number"),
        type: z.enum(Object.values(USER_TYPE) as [USER_TYPE, ...USER_TYPE[]]),
        interests: z.array(z.enum(Object.values(COURSE) as [COURSE, ...COURSE[]])).optional(),
        pronouns: z.string().optional(),
        birthday: z.date().optional(),
        school: z.enum(Object.values(CAMPUS) as [CAMPUS, ...CAMPUS[]]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        type,
        interests,
        pronouns,
        birthday,
        school,
      } = input;

      try {
        const newUser = await ctx.db.user.create({
          data: {
            firstName,
            lastName,
            email,
            phoneNumber: "+1" + phoneNumber,
            type,
            interests,
            pronouns,
            birthday,
            school,
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
        type: z.enum(Object.values(USER_TYPE) as [USER_TYPE, ...USER_TYPE[]]).optional(),
        isArchived: z.boolean().optional(),
        isPinned: z.boolean().optional(),
        unreadMessage: z.boolean().optional(),
        interests: z.array(z.enum(Object.values(COURSE) as [COURSE, ...COURSE[]])).optional(),
        pronouns: z.string().optional(),
        birthday: z.date().optional(),
        school: z.enum(Object.values(CAMPUS) as [CAMPUS, ...CAMPUS[]]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        firstName,
        lastName,
        email,
        phoneNumber,
        type,
        isArchived,
        isPinned,
        unreadMessage,
        interests,
        pronouns,
        birthday,
        school,
      } = input;

      try {
        return await ctx.db.user.update({
          where: { id },
          data: {
            firstName,
            lastName,
            phoneNumber: phoneNumber ? "+1" + phoneNumber : undefined,
            email,
            type,
            isArchived,
            isPinned,
            unreadMessage,
            interests,
            pronouns,
            birthday,
            school
          },
          include: {
            family: true,
            enrollment: true,
          }
        });
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
          include: {
            family: true,
            enrollment: true,
          }
        });

        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to retrieve users");
      }
    }),
  getAllContacts: protectedProcedure
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
          include: {
            enrollment: {
              include: {
                section: {
                  include: {
                    teacher: true
                  }
                }
              }
            },
            family: true,
          }
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
          },
          include: {
            family: true,
            enrollment: true,
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
    }),
  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(), // The search query (optional)
        skip: z.number().optional(), // Pagination support
        take: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, skip, take } = input;

      try {
        return await ctx.db.user.findMany({
          where: query
            ? {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phoneNumber: { contains: query, mode: "insensitive" } },
                {
                  smsMessages: {
                    some: {
                      OR: [
                        { body: { contains: query, mode: "insensitive" } },
                      ],
                    },
                  },
                },
                {
                  emailMessages: {
                    some: {
                      OR: [
                        { subject: { contains: query, mode: "insensitive" } },
                        { body: { contains: query, mode: "insensitive" } },
                      ],
                    },
                  },
                },
              ],
            }
            : {}, // If no query, return all users
          skip,
          take,
          orderBy: { lastName: "asc" },
          include: {
            family: true,
            smsMessages: true, // Include SMS messages in the response
            emailMessages: true, // Include email messages in the response
            enrollment: true,
          },
        });
      } catch (error) {
        console.error("Error searching users:", error);
        throw new Error("Failed to search users");
      }
    }),
});
