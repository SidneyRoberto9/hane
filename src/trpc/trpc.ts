import { TRPCError, initTRPC } from '@trpc/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const t = initTRPC.create();
const middleware = t.middleware;

const isAth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user.id || !user.email) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAth);
