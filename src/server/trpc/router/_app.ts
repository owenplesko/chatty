import { router } from "../trpc";
import { accountRouter } from "./account";
import { messageRouter } from "./message";

export const appRouter = router({
  account: accountRouter,
  message: messageRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
