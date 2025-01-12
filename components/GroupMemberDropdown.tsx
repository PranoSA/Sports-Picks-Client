import { useGetGroupUsers } from '@/queries/groups';

import { FetchedGroup, FetchedGroup_User } from '@/types/bets_and_odds';

import { useEffect, useMemo, useState } from 'react';

import { FaAngleDown, FaAngleUp, FaCrown, FaUser } from 'react-icons/fa';

import { useGetScoresForGroup } from '@/queries/scores';
import Use_is_admin from '@/queries/admin';

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

  const [selectedUUID, setSelectedUUID] = useState('');

  //on mont -> set the selectedUUID to the pretend person
  useEffect(() => {
    const pretendPerson = localStorage.getItem('pretend_person');
    if (pretendPerson) {
      setSelectedUUID(pretendPerson);
    }
  }, []);

  //check if admin
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isError: adminError,
  } = Use_is_admin();

  const is_admin = useMemo(() => {
    if (isAdmin === undefined) {
      return false;
    }
    if (isAdmin?.is_admin) {
      return true;
    }
    return false;
  }, [isAdmin]);

  useEffect(() => {
    console.log('Group Scores', groupScores);
  }, [groupScores]);

  const [openMemberList, setOpenMemberList] = useState(false);

  useEffect(() => {
    console.log('Should Be ', openMemberList);
  }, [openMemberList]);

  const setPretendPerson = (uuid: string) => {
    console.log('Setting Pretend Person', uuid);
    setSelectedUUID(uuid);
    localStorage.setItem('pretend_person', uuid);
  };

  const clearPretendPerson = () => {
    console.log('Clearing Pretend Person');
    localStorage.removeItem('pretend_person');
    setSelectedUUID('');
  };

  //the member list component will show when the show member list button is clicked
  // it just shows the members of the group, nothing else
  const memberListComponent = useMemo(() => {
    if (!openMemberList) {
      return null;
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (isError) {
      return <div>Error: </div>;
    }

    return (
      <div className="">
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
              {/* If Admin, show the pretend person button */}
              {is_admin && (
                <button
                  onClick={() => setPretendPerson(member.user_id)}
                  className="text-blue-500"
                >
                  Pretend Person
                </button>
              )}
              {/* If Admin, show the clear pretend person button */}
              {is_admin && selectedUUID === member.user_id && (
                <button
                  onClick={() => clearPretendPerson()}
                  className="text-red-500"
                >
                  Clear Pretend Person
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }, [groupMembers, isError, isLoading, openMemberList]);

  return (
    <div className=" w-full flex flex-row flex-wrap">
      <h1 className="text-2xl font-bold ">Members</h1>
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
      <div className="w-full">{memberListComponent}</div>
    </div>
  );
};

export default GroupPad;
