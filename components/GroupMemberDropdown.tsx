import { useGetGroupUsers } from '@/queries/groups';

import { FetchedGroup, FetchedGroup_User } from '@/types/bets_and_odds';

import { useEffect, useMemo, useState } from 'react';

import { FaAngleDown, FaAngleUp, FaCrown, FaUser } from 'react-icons/fa';

import { useGetScoresForGroup } from '@/queries/scores';

type GroupPadProps = {
  group: FetchedGroup;
};

const GroupPad = ({ group }: GroupPadProps) => {
  const {
    data: groupMembers,
    isLoading,
    isError,
    error,
  } = useGetGroupUsers(group.group_id);

  const { data: groupScores, isError: scoresError } = useGetScoresForGroup(
    group.group_id
  );

  useEffect(() => {
    console.log('Group Scores', groupScores);
  }, [groupScores]);

  const [openMemberList, setOpenMemberList] = useState(false);

  useEffect(() => {
    console.log('Should Be ', openMemberList);
  }, [openMemberList]);

  //the member list component will show when the show member list button is clicked
  // it just shows the members of the group, nothing else
  const memberListComponent = useMemo(() => {
    if (!openMemberList) {
      return <h1 className="text-2xl font-bold mb-4">Members</h1>;
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (isError) {
      return <div>Error: </div>;
    }

    return (
      <div className="">
        <h1 className="text-2xl font-bold mb-4">Members</h1>
        <ul className="space-y-4">
          {groupMembers?.map((member) => (
            <li key={member.user_id}>
              {member.user_name}

              {/* crown icon */}
              {member.position === 'admin' && (
                <span className="text-yellow-500">
                  <FaCrown />
                </span>
              )}
              {/* Regular User */}
              {member.position === 'member' && (
                <span className="text-gray-500">
                  <FaUser />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }, [groupMembers, isError, isLoading, openMemberList]);

  return (
    <div className=" w-full">
      {!openMemberList ? (
        <FaAngleDown
          onClick={() => setOpenMemberList(true)}
          className="cursor-pointer"
          size={24}
        />
      ) : (
        <FaAngleUp
          onClick={() => setOpenMemberList(false)}
          className="cursor-pointer"
          size={24}
        />
      )}
      {memberListComponent}
    </div>
  );
};

export default GroupPad;
