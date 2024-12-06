/**
 *
 *
 * In the future, a passcode will be sntrance will be used to join the group
 *
 * For now -> you will just be asked to confirm you want to join the group
 * And it will show the name of the group, etc.
 */
'use client';

import { useGetGroupById, useJoinGroup } from '@/queries/groups';

import { QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider } from 'next-auth/react';

import queryClient from '@/queries/queryclient';
import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Session } from 'next-auth';

import { useEffect } from 'react';

//wrapper
const JoinPageWithQueryClient: React.FC<{
  params: {
    id: string;
  };
}> = ({ params: { id } }) => {
  const sessionProviderProps = {
    children: <JoinPage id={id} />,
  };

  console.log('id', id);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider {...sessionProviderProps} />
    </QueryClientProvider>
  );
};

const JoinPage: React.FC<{
  id: string;
}> = ({ id }) => {
  const { data: group, isLoading } = useGetGroupById(id);

  const session = useSession();

  const joinGroup = useJoinGroup();

  console.log('id', id);

  useEffect(() => {
    //set local storage bearer token
    if (typeof window !== 'undefined' && session) {
      localStorage.setItem('accessToken', session.data?.accessToken as string);
      //set date_redeemed -> store unix timestamp
      const now_time = Date.now();
      const unix_time = Math.floor(now_time / 1000);

      localStorage.setItem('date_redeemed', unix_time.toString());
    }
  }, [session]);

  const joinGroupSubmission = async () => {
    //call the join group mutation
    await joinGroup.mutateAsync({
      group_id: id,
      passcode: '',
    });

    //redirect to the group page
  };

  if (session.status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session.data) {
    return (
      <div>
        <button onClick={() => signIn('keycloak')}>Sign in</button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div>
      <h1>Join {group.group_name}</h1>
      <p>Are you sure you want to join this group?</p>
      <button
        onClick={joinGroupSubmission}
        className="p-4 bg-blue-500 text-white rounded-lg shadow-md"
      >
        Join
      </button>
    </div>
  );
};

export default JoinPageWithQueryClient;
