//login
import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';

/*
const GroupHomePageWithSessionProvider = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const sessionProviderProps: SessionProviderProps = {
    children: (
      <GroupHomePageWithProvider
        params={{
          id: params.id,
        }}
      />
    ),
  };
  */
