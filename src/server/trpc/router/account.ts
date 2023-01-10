import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import bcrypt from "bcrypt";

export const accountRouter = router({
  register: publicProcedure
  .input(z.object({username: z.string(), password: z.string()}))
  .mutation(async ({ input: {username, password}, ctx }) => {
    if(await ctx.prisma.user.findUnique({where: {username}}))
      throw new Error('username is taken');
    const hashedPassword = bcrypt.hashSync(password, 10);
    await ctx.prisma.user.create({data: {username, password: hashedPassword}});
  })
});
