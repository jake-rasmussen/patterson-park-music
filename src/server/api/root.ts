import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { personRouter } from "./routers/person";
import { enrollmentRouter } from "./routers/enrollment";
import { familyRouter } from "./routers/family";
import { sectionRouter } from "./routers/section";
import { tagPersonRouter } from "./routers/tag";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  person: personRouter,
  enrollment: enrollmentRouter,
  family: familyRouter,
  section: sectionRouter,
  tag: tagPersonRouter,
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
