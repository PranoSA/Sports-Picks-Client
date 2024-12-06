/**
 *
 *
 * Get Group Page
 *
 */
'use client';

import { useGetGroups, useCreateGroup } from '@/queries/groups';

import queryClient from '@/queries/queryclient';

import { QueryClientProvider } from '@tanstack/react-query';

import Link from 'next/link';

//viist icon
import { FaTrash, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Page = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GetGroupPage />
    </QueryClientProvider>
  );
};

function GetGroupPage() {
  const { data, isLoading, isError } = useGetGroups();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching groups</div>;
  }

  if (!data) {
    return <div>No groups found</div>;
  }

  return (
    <div className="w-full flex flex-wrap justify-center">
      <h1 className="w-full text-center dark:text-green-500">Groups</h1>
      <ul>
        {data.map((group) => (
          <div key={group.group_id} className="border-4 border-white p-5 ">
            <h1 className="text-lg dark:text-gray-200">{group.group_name}</h1>
            <li key={group.group_id}>
              <Link href={`/group/2024-2025/${group.group_id}/picks`}>
                <FaCheckCircle className="text-green-500" />
              </Link>
              <h2 className="text-lg dark:text-gray-300">Members</h2>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default Page;
