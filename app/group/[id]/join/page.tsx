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
  //set to dark mode
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

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
    const res = await joinGroup.mutateAsync({
      group_id: id,
      passcode: '',
    });

    console.log('res', res);

    //if error, alert the user
    if (!res) {
      alert('Error joining group');
      return;
    }

    //if success, redirect to the group page
    window.location.href = `/group/${id}`;

    //redirect to the group page
  };

  if (session.status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="grid place-items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Sports Betting App
          </h1>
          <p className="mb-6">
            This app allows you to create groups, make choices, and track your
            bets. Join now and start making your picks!
          </p>
          <button
            onClick={() => signIn('keycloak')}
            className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </div>
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Join {group.group_name}
        </h1>
        <p className="mb-6 text-center text-gray-700 dark:text-gray-300">
          Are you sure you want to join this group?
        </p>
        {/* another pargraph with group details */}
        <div className="mb-6">
          <span className="font-semibold">Group : {group.group_name} </span>{' '}
          {id}
        </div>
        <button
          onClick={joinGroupSubmission}
          className="w-full p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default JoinPageWithQueryClient;
