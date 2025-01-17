'use client';
import Image from 'next/image';

//login
import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';
import { Session } from 'next-auth';

import Link from 'next/link';

import Use_is_admin from '@/queries/admin';

import { useGetGroups } from '@/queries/groups';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddWeeks, useGetWeeks, useDeleteWeek } from '@/queries/weeks';
import queryClient from '@/queries/queryclient';

import { useEffect, useMemo, useState } from 'react';

import CreateGroupForm from '@/components/Create_Group_Form';

import GroupPad from '@/components/GroupMemberDropdown';

import GroupStore from '@/components/GroupStore';
import { FetchedGroup } from '@/types/bets_and_odds';

//import react/fa-icons for dropdown and up and down arrows
import { FaAngleDown, FaAngleUp, FaExternalLinkAlt } from 'react-icons/fa';

//import icons that show leadership role (maybe crown), and then a regular user icon
import { FaCrown, FaUser } from 'react-icons/fa';
import { useGetYears } from '@/queries/years';

const HomeWithSessionProvider = () => {
  const sessionProviderProps: SessionProviderProps = {
    children: <HomeWithQueryProvider />,
  };

  return <SessionProvider {...sessionProviderProps} />;
};

const HomeWithQueryProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
};

function Home() {
  //if not authenticated, login to keycloak provider
  //const { data: session } = useSession() as { data: Session | null };
  const { data: session, status } = useSession();

  //set to dark mode
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

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

  const { data: is_admin } = Use_is_admin();

  console.log('Is Admin?', is_admin?.is_admin);

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

  return (
    <div className="flex flex-col p-4 dark:bg-black">
      {
        //if is admin, show admin panel
        is_admin?.is_admin && <AdminPanel />
      }
      <ListOfGroupsComponent />
    </div>
  );
}

const ListOfGroupsComponent = () => {
  const { data: groups, isLoading, isError, error } = useGetGroups();

  const openCreateGroup = () => {
    GroupStore.setState({ adding_group: true });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: </div>;
  }

  return (
    <div className="p-4 flex flex-col items-center dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Add a Group</h1>
      <button
        onClick={openCreateGroup}
        className="mb-4 p-2 bg-blue-500 text-white rounded dark:text-black"
      >
        Create Group
      </button>

      <div className="w-full max-w-md">
        <CreateGroupForm />
      </div>

      <h1 className="text-2xl font-bold mb-4 dark:text-white">Groups</h1>
      <ul className="w-full max-w-md space-y-4 flex flex-wrap flex-row">
        {groups?.map((group) => (
          <li
            key={group.group_id}
            className="flex flex-wrap p-4 border rounded bg-white dark:bg-gray-600 shadow-md w-full max-w-1/2"
          >
            <Link
              href={`/group/${group.group_id}`}
              className="border-b-2 border-transparent hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-blue-500 "
            >
              <div className="flex flex-row w-full">
                <h1 className="text-xl font-bold dark:text-white m-3">
                  {group.group_name}
                </h1>

                <FaExternalLinkAlt
                  size={16}
                  className="cursor-pointer text-blue-500 m-4"
                />
                <h1 className="text-xl font-bold dark:text-white m-3">
                  {' '}
                  Visit Group{' '}
                </h1>
                {/* */}
              </div>
            </Link>
            {/* Button to copy a "join code" */}
            <button
              className="p-2 bg-blue-500 text-white rounded-lg shadow-md"
              onClick={() => {
                navigator.clipboard.writeText(
                  `sportspicks.compressibleflowcalculator.com/group/${group.group_id}/join`
                );
              }}
            >
              Copy Join Code
            </button>
            <GroupPad group={group} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  /**
   * All this panel will do will have a a link to /admin/year
   *
   *
   *
   */

  const { data: years, isLoading, isError, error } = useGetYears();

  const current_year_id = useMemo(() => {
    const current_date = new Date();
    const current_year = years?.find((year) => {
      return (
        new Date(year.start_date) <= current_date &&
        new Date(year.end_date) >= current_date
      );
    });

    return current_year?.year_id || '';
  }, [years]);

  const {
    data: weeks,
    isLoading: weeksLoading,
    isError: weeksError,
  } = useGetWeeks(current_year_id);

  const current_week_id = useMemo(() => {
    if (weeks === undefined) {
      return '';
    }
    const current_date = new Date();
    const current_week = weeks?.find((week) => {
      return (
        new Date(week.start_date) <= current_date &&
        new Date(week.end_date) >= current_date
      );
    });

    return current_week?.week_id || '';
  }, [weeks]);

  return (
    <div className="flex flex-col items-center justify-center  p-6 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Admin Panel
        </h1>
        <Link href="/admin" className="mb-4">
          <div className="block w-full py-3 px-4 text-center text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition duration-300 cursor-pointer">
            Go to Admin Year
          </div>
        </Link>
        {/* Add Links to Current Year and Current Week */}
        <Link href={`/admin/year/${current_year_id}`} className="mb-4">
          <div className="block w-full py-3 px-4 text-center text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition duration-300 cursor-pointer">
            Go to Current Year
          </div>
        </Link>
        <Link
          href={`/admin/year/${current_year_id}/week/${current_week_id}`}
          className="mb-4"
        >
          <div className="block w-full py-3 px-4 text-center text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition duration-300 cursor-pointer">
            Go to Current Week
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomeWithSessionProvider;
