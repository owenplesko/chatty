import { type inferAsyncReturnType } from "@trpc/server";
import { type Session } from "next-auth";

import { getServerAuthSession } from "../common/get-server-auth-session";
import { prisma } from "../db/client";
import { NextApiRequest } from "next";
import NextApiResponseServerIO from "../../types/next-socketio";
import { Server as ServerIO } from "socket.io";

type CreateContextOptions = {
  session: Session | null;
  chatSocket: ServerIO;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    chatSocket: opts.chatSocket,
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: {req: NextApiRequest, res: NextApiResponseServerIO}) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res});
  const chatSocket = res.socket.server.io;

  return await createContextInner({
    session,
    chatSocket
  });
};

export type Context = inferAsyncReturnType<typeof createContext>;
