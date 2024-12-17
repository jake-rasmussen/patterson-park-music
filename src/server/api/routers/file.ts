import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabase } from "~/server/supabase/supabaseClient"; // Import the Supabase client

export const fileRouter = createTRPCRouter({
  // TODO: double check access rights for bucket, right now its public
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        bucket: z.string().default("media"), // Default bucket name
        filePath: z.string(), // File path within the bucket
        expiresIn: z.number().default(3600), // URL expiration in seconds
      })
    )
    .mutation(async ({ input }) => {
      const { bucket, filePath, expiresIn } = input;

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error("Error creating presigned URL:", error);
        throw new Error("Failed to create presigned URL");
      }

      return data.signedUrl;
    }),

  getUploadUrl: publicProcedure
    .input(
      z.object({
        bucket: z.string().default("media"), // Bucket name
        filePath: z.string(), // Path to save the file within the bucket
      })
    )
    .mutation(async ({ input }) => {
      const { bucket, filePath } = input;

      // Generate presigned URL for uploading
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error("Error creating presigned upload URL:", error);
        throw new Error("Failed to create presigned upload URL");
      }

      return data.signedUrl;
    }),
});
