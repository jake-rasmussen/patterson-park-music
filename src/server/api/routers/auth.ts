import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
// import { createClient } from "~/utils/supabase/server";

export const authRouter = createTRPCRouter({
  // login: publicProcedure
  //   .input(
  //     z.object({
  //       email: z.string(),
  //       password: z.string(),
  //     })
  //   )
  //   .mutation(async ({ input }) => {
  //     const { email, password } = input;

  //     try {
  //       console.log("DEBUG: Starting login process");

  //       const supabaseClient = await createClient();
  //       const { data, error } = await supabaseClient.auth.signInWithPassword({
  //         email,
  //         password,
  //       });

  //       console.log("DEBUG: Supabase response", { data, error });

  //       if (error) {
  //         console.error("Supabase login error:", error);
  //         throw new Error(`Login failed: ${error.message}`);
  //       }

  //       return {
  //         message: "Login successful",
  //         user: data?.user,
  //         session: data?.session,
  //       };
  //     } catch (err) {
  //       console.error("Unexpected error in tRPC login:", err);
  //       throw new Error("Unexpected error occurred during login.");
  //     }
  //   }),
});

