import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CAMPUS } from "@prisma/client";

export const familyRouter = createTRPCRouter({
  createFamily: protectedProcedure
    .input(
      z.object({
        familyName: z.string().min(1, "Family name is required"),
        campus: z.nativeEnum(CAMPUS).refine((value) => value !== undefined, {
          message: "Campus is required",
        }),
        doorCode: z.string(),
        userIds: z.array(z.string()).nonempty("At least one user must be selected"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { familyName, campus, doorCode, userIds } = input;

      try {
        const newFamily = await ctx.db.family.create({
          data: {
            familyName,
            campus,
            doorCode,
            users: {
              connect: userIds.map((id) => ({ id })),
            },
          },
        });
        return { success: true, family: newFamily };
      } catch (error) {
        console.error("Error creating family:", error);
        throw new Error("Failed to create family");
      }
    }),
  updateFamily: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        familyName: z.string().min(1, "Family name is required").optional(),
        campus: z.nativeEnum(CAMPUS).refine((value) => value !== undefined, {
          message: "Campus is required",
        }).optional(),
        doorCode: z.string().optional(),
        userIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, familyName, campus, doorCode, userIds } = input;

      try {
        const updatedFamily = await ctx.db.family.update({
          where: { id },
          data: {
            familyName,
            campus,
            doorCode,
            users: userIds
              ? {
                set: userIds.map((id) => ({ id })),
              }
              : undefined,
          },
        });
        return { success: true, family: updatedFamily };
      } catch (error) {
        console.error("Error updating family:", error);
        throw new Error("Failed to update family");
      }
    }),
  deleteFamily: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.family.delete({
          where: { id },
        });
        return { success: true };
      } catch (error) {
        console.error("Error deleting family:", error);
        throw new Error("Failed to delete family");
      }
    }),
  getFamilyById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const family = await ctx.db.family.findUnique({
          where: { id },
          include: { users: true }, // Include related users
        });

        if (!family) {
          throw new Error("Family not found");
        }

        return family;
      } catch (error) {
        console.error("Error fetching family:", error);
        throw new Error("Failed to retrieve family");
      }
    }),
  getAllFamilies: protectedProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        take: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { skip, take } = input || {};

      try {
        const families = await ctx.db.family.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { users: true }, // Include related users
        });
        
        return families;
      } catch (error) {
        console.error("Error fetching families:", error);
        throw new Error("Failed to retrieve families");
      }
    }),
});
