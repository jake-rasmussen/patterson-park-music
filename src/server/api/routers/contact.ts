import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const contactRouter = createTRPCRouter({
  // Procedure to create a new contact
  createContact: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, phoneNumber } = input;

      try {
        const newContact = await ctx.db.contact.create({
          data: {
            firstName,
            lastName,
            email,
            phoneNumber,
          },
        });
        return { success: true, contact: newContact };
      } catch (error) {
        console.error("Error creating contact:", error);
        throw new Error("Failed to create contact");
      }
    }),
  // Procedure to update an existing contact
  updateContact: publicProcedure
    .input(
      z.object({
        id: z.string(), // ID of the contact to update
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        personId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      try {
        const updatedContact = await ctx.db.contact.update({
          where: { id },
          data: updateData,
        });
        return { success: true, contact: updatedContact };
      } catch (error) {
        console.error("Error updating contact:", error);
        throw new Error("Failed to update contact");
      }
    }),
  // Procedure to get all contacts
  getAllContacts: publicProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        take: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { skip, take } = input || {};

      try {
        const contacts = await ctx.db.contact.findMany({
          skip,
          take,
          orderBy: { lastName: "asc" }, // Example ordering by last name
        });

        return contacts;
      } catch (error) {
        console.error("Error fetching contacts:", error);
        throw new Error("Failed to retrieve contacts");
      }
    }),
});
