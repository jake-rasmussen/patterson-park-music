import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { enrollmentRouter } from "./routers/enrollment";
import { sectionRouter } from "./routers/section";
import { tagPersonRouter } from "./routers/tag";
import { smsRouter } from "./routers/sms";
import { userRouter } from "./routers/user";
import { fileRouter } from "./routers/file";
import { emailRouter } from "./routers/email";
import { supabaseRouter } from "./routers/supabase";
import { futureSMSRouter } from "./routers/futureSMS";
import { futureEmailRouter } from "./routers/futureEmail";
import { familyRouter } from "./routers/family";
import { bulkRouter } from "./routers/bulk";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  enrollment: enrollmentRouter,
  section: sectionRouter,
  tag: tagPersonRouter,
  sms: smsRouter,
  user: userRouter,
  file: fileRouter,
  email: emailRouter,
  supabase: supabaseRouter,
  futureSMS: futureSMSRouter,
  futureEmail: futureEmailRouter,
  family: familyRouter,
  bulk: bulkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
