import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const messageRouter = router({
  send: protectedProcedure
  .input(z.object({content: z.string().min(1)}))
  .mutation(async ({ input: {content}, ctx: {prisma, session, chatSocket} }) => {
    if(!session.user.name)
        throw new Error('no user');
    const message = await prisma.message.create({
        data: {
            content,
            author: {
                connect: {
                    id: session.user.id
                }
            }
        }
    })
    chatSocket.emit('newMessage', {...message, author: {username: session.user.name, id: session.user.id}});
    return {message};
  }),
  history: publicProcedure
  .input(z.object({take: z.number().nullish(), skip: z.number().nullish()}).nullish())
  .query(async ({input, ctx: {prisma}}) => {
    const messages = await prisma.message.findMany({
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: input?.take ? input.take : 20,
        skip: input?.skip ? input.skip : undefined
    });
    return {messages};
  })
});
