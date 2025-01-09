import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createClient } from "~/utils/supabase/client/component";

const extractFilePathFromSignedUrl = (url: string) => {
  const urlObject = new URL(url);
  const filePathMatch = urlObject.pathname.match(/\/storage\/v1\/object\/sign\/media\/(.+)/);

  if (!filePathMatch || filePathMatch.length < 2) {
    throw new Error("Invalid signed URL. Unable to extract file path.");
  }

  return filePathMatch[1]!;
}

const supabaseClient = createClient();

export const fileRouter = createTRPCRouter({
  // TODO: double check access rights for bucket, right now its public
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        bucket: z.string().default("media"), // Default bucket name
        filePath: z.string(), // File path within the bucket
        expiresIn: z.number().default(3600), // URL expiration in seconds
      })
    )
    .mutation(async ({ input }) => {
      const { bucket, filePath, expiresIn } = input;

      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error("Error creating presigned URL:", error);
        throw new Error("Failed to create presigned URL");
      }

      return data.signedUrl;
    }),

  getUploadUrl: protectedProcedure
    .input(
      z.object({
        bucket: z.string().default("media"),
        filePath: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { bucket, filePath } = input;

      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error("Error creating presigned upload URL:", error);
        throw new Error("Failed to create presigned upload URL");
      }

      return data.signedUrl;
    }),
  deleteFiles: protectedProcedure
    .input(
      z.object({
        bucket: z.string().default("media"),
        filePaths: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { bucket, filePaths } = input;

      const resolvedPaths = filePaths.map((path) => {
        try {
          return path.startsWith("http") ? extractFilePathFromSignedUrl(path) : path;
        } catch (error) {
          console.error("Error extracting file path:", error, "for URL:", path);
          throw new Error("Failed to resolve file paths for deletion.");
        }
      });

      // Call Supabase's remove method
      const { data, error } = await supabaseClient.storage.from(bucket).remove(resolvedPaths);

      if (error) {
        console.error("Error deleting files from Supabase storage:", error);
        throw new Error("Failed to delete files from storage");
      }

      return { success: true, deleted: data };
    }),
});
