import { z } from 'zod';

import { TRPCError } from '@trpc/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { router, publicProcedure, privateProcedure } from '@/trpc/trpc';
import { db } from '@/db';

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user.id || !user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id } = input;

      const file = await db.file.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await db.file.delete({
        where: {
          id,
        },
      });

      return file;
    }),
});

export type AppRouter = typeof appRouter;