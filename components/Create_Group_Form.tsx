import { useState, useEffect } from 'react';
import { Bet, InsertionGroup } from '@/types/bets_and_odds';
import { useCreateGroup } from '@/queries/groups';

import useGroupStore from '@/components/GroupStore';

const CreateGroupForm: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [bets, setBets] = useState<Bet[]>([]);

  const [betsError, setBetsError] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numPoints, setNumPoints] = useState<number>(0);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [type, setType] = useState<'spread' | 'over_under' | 'moneyline'>(
    'spread'
  );

  const createGroup = useCreateGroup();

  const { adding_group } = useGroupStore();

  useEffect(() => {
    if (isSubmitting) {
      if (groupName && bets.length) {
        console.log('Submit form');
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const addBet = () => {
    if (numPoints < 1 || numPoints > 10) {
      setPointsError('Number of points must be between 1 and 10');
      return;
    }

    const new_bet: Bet = { type: type, num_points: numPoints };

    const new_bets = [...bets, new_bet];
    setBets(new_bets);
    setPointsError(null);
    setNumPoints(1);
  };

  const removeBet = (index: number) => {
    setBets((prevBets) => prevBets.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGroupNameError('');
    setBetsError('');
    if (!groupName) {
      setGroupNameError('Group Name is required');
    }
    if (!bets.length) {
      setBetsError('At least one bet is required');
    }
    setIsSubmitting(true);
    submitGroup();
    // createGroup.mutate({ name: groupName, bets: bets });
  };

  const submitGroup = async () => {
    if (groupName && bets.length) {
      const new_group: InsertionGroup = {
        group_name: groupName,
        bets: bets,
      };

      await createGroup.mutate({
        group_name: groupName,
        bets: bets,
      });

      //close if successful
      if (createGroup.isSuccess) {
        useGroupStore.setState({ adding_group: false });
      }
    }
  };

  const closeModel = () => {
    useGroupStore.setState({ adding_group: false });
  };

  if (!adding_group) {
    return <div></div>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModel}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-semibold mt-8">Create Group</h1>
        <form onSubmit={handleFormSubmit} className="mt-4 w-full max-w-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="groupName" className="text-sm font-semibold">
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
                />
                {groupNameError && (
                  <span className="text-red-500 text-sm">{groupNameError}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="type" className="text-sm font-semibold">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as 'spread' | 'over_under' | 'moneyline'
                  )
                }
                className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="spread">Spread</option>
                <option value="over_under">Over/Under</option>
                <option value="moneyline">Moneyline</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="numPoints" className="text-sm font-semibold">
                Number of Points
              </label>
              <input
                type="number"
                id="numPoints"
                step={1}
                min={1}
                max={10}
                value={numPoints}
                onChange={(e) => setNumPoints(parseInt(e.target.value))}
                className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
              />
              {pointsError && (
                <span className="text-red-500 text-sm">{pointsError}</span>
              )}
            </div>
            <button
              type="button"
              onClick={addBet}
              className="p-2 bg-green-500 text-white rounded"
            >
              Add Bet
            </button>
          </div>
          {betsError && (
            <span className="text-red-500 text-sm">{betsError}</span>
          )}
          <ul className="mt-4 space-y-2">
            {bets.map((bet, index) => (
              <li
                key={index}
                className="flex items-center gap-4 p-2 border rounded bg-white dark:bg-gray-800 dark:text-gray-200"
              >
                <span>{bet.type}</span>
                <span>{bet.num_points}</span>
                <button
                  type="button"
                  onClick={() => removeBet(index)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded mt-4"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupForm;
