'use client';
import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '@/queries/queryclient';

import Link from 'next/link';

import React, { useEffect, useMemo, useState } from 'react';
import { useGetGroupById } from '@/queries/groups';

import GroupMemberDropdown from '@/components/GroupMemberDropdown';

import WeekMenu from '@/components/WeekMenu';

import { FaChartBar } from 'react-icons/fa';

//get games by week
import { useGetGamesByWeek } from '@/queries/games';

//login
import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';

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

  return <SessionProvider {...sessionProviderProps} />;
};

//
const GroupHomePageWithProvider: React.FC<{
  params: {
    id: string;
  };
}> = ({ params: { id } }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GroupHomePage params={{ id }} />
    </QueryClientProvider>
  );
};

const GroupHomePage: React.FC<{
  params: {
    id: string;
  };
}> = ({ params: { id } }) => {
  //get grou

  //use session
  const { data: session, status } = useSession();

  const { data: group, isLoading, isError } = useGetGroupById(id);

  useEffect(() => {
    //set local storage bearer token
    if (typeof window !== 'undefined' && session) {
      localStorage.setItem('accessToken', session.accessToken as string);
      //set date_redeemed -> store unix timestamp
      const now_time = Date.now();
      const unix_time = Math.floor(now_time / 1000);

      localStorage.setItem('date_redeemed', unix_time.toString());
    }
  }, [session]);

  const [showSummaryOfSelectedWeek, setShowSummaryOfSelectedWeek] =
    useState<boolean>(false);

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

  if (isError) {
    return <div>Error fetching group</div>;
  }

  if (!group) {
    return <div>No group found</div>;
  }

  return (
    <div className="p-4 flex flex-col items-center dark:bg-gray-800 bg-gray-800">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Group Details
        </h1>
        <div className="mb-4 dark:text-white">
          <span className="font-semibold">Group Name:</span> {group.group_name}
        </div>
        {/* View Results */}
        <div className="mb-4 dark:text-white">
          <Link
            href={`/group/${id}/scores`}
            className="flex flex-row items-center"
          >
            <FaChartBar className="mr-2" size={30} />
            <h1 className="text-2xl font-bold mb-4 dark:text-white">
              View Results
            </h1>
          </Link>
        </div>
        <div className="mb-4 dark:text-white">
          <GroupMemberDropdown group={group} />
        </div>
        <Link href={`/group/${id}/picks`}></Link>
      </div>
      <WeekMenu group={group} />
    </div>
  );
};

export default GroupHomePageWithSessionProvider;
