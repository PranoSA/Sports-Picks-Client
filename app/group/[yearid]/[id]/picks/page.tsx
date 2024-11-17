/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 *
 * Here is to show the picks of the week
 *
 * It will show the Active Week
 *
 *
 */

'use client';

import {
  GameOdds,
  Group,
  Year,
  Week,
  Bet,
  Choice,
  Game,
} from '@/types/bets_and_odds';
import { use, useEffect, useMemo, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '@/queries/queryclient';

//queries for getting games
import { useGetGames, useGetCurrentWeekGames } from '@/queries/games';

//queries for getting the group
import { useGetGroupById } from '@/queries/groups';

//queries for getting the week
import { useGetWeeks } from '@/queries/weeks';

/**
 *
 * Sample :
 * Lets demonstrate the logic of
 *
 * This is the default page -> which will show the current week
 */

//wrap the page in the query client provider
const PageWithQueryProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
};

const sampleBets: Bet[] = [
  {
    type: 'spread',
    num_points: 10,
  },
  {
    type: 'over_under',
    num_points: 5,
  },
  {
    type: 'spread',
    num_points: 7,
  },
  {
    type: 'over_under',
    num_points: 3,
  },
];

const sampleGroup: Group = {
  group_name: 'Group 1',

  year: '2024-2025',
  bets: sampleBets,
};

const year: Year = {
  year: '2024-2025',
  weeks: [
    {
      start: new Date('2024-09-01'),
      end: new Date('2024-09-07'),
      nickname: 'Week 1',
    },
    {
      start: new Date('2024-09-08'),
      end: new Date('2024-09-14'),
      nickname: 'Week 2',
    },
    {
      start: new Date('2024-09-15'),
      end: new Date('2024-09-21'),
      nickname: 'Week 3',
    },
    //do week that includes today [2024-11-13]
    {
      start: new Date('2024-11-08'),
      end: new Date('2024-11-14'),
      nickname: 'Week 10',
    },
    //week after
    {
      start: new Date('2024-11-15'),
      end: new Date('2024-11-21'),
      nickname: 'Week 11',
    },
  ],
};

const games: Game[] = [
  {
    home_team: 'Washington Football Team',
    away_team: 'Tampa Bay Buccaneers',
    neutral: false,
    odds: -10,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'New Orleans Saints',
    away_team: 'Philadelphia Eagles',
    neutral: false,
    odds: 3,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'New York Giants',
    away_team: 'Dallas Cowboys',
    neutral: false,
    odds: 7,
    over_under: 55,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'San Francisco 49ers',
    away_team: 'Los Angeles Rams',
    neutral: false,
    odds: -3,
    over_under: 40,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Seattle Seahawks',
    away_team: 'Arizona Cardinals',
    neutral: false,
    odds: 5,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Kansas City Chiefs',
    away_team: 'Las Vegas Raiders',
    neutral: false,
    odds: -7,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Green Bay Packers',
    away_team: 'Minnesota Vikings',
    neutral: false,
    odds: -3,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Pittsburgh Steelers',
    away_team: 'Cleveland Browns',
    neutral: false,
    odds: -5,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Buffalo Bills',
    away_team: 'Miami Dolphins',
    neutral: false,
    odds: -3,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Tennessee Titans',
    away_team: 'Indianapolis Colts',
    neutral: false,
    odds: 3,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Baltimore Ravens',
    away_team: 'Cincinnati Bengals',
    neutral: false,
    odds: -10,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Los Angeles Chargers',
    away_team: 'Denver Broncos',
    neutral: false,
    odds: -3,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Atlanta Falcons',
    away_team: 'Carolina Panthers',
    neutral: false,
    odds: 3,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Detroit Lions',
    away_team: 'Chicago Bears',
    neutral: false,
    odds: 7,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Houston Texans',
    away_team: 'Jacksonville Jaguars',
    neutral: false,
    odds: 10,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'New England Patriots',
    away_team: 'New York Jets',
    neutral: false,
    odds: -7,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'New Orleans Saints',
    away_team: 'Philadelphia Eagles',
    neutral: false,
    odds: 3,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'New York Giants',
    away_team: 'Dallas Cowboys',
    neutral: false,
    odds: 7,
    over_under: 55,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'San Francisco 49ers',
    away_team: 'Los Angeles Rams',
    neutral: false,
    odds: -3,
    over_under: 40,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Seattle Seahawks',
    away_team: 'Arizona Cardinals',
    neutral: false,
    odds: 5,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Kansas City Chiefs',
    away_team: 'Las Vegas Raiders',
    neutral: false,
    odds: -7,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Green Bay Packers',
    away_team: 'Minnesota Vikings',
    neutral: false,
    odds: -3,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Pittsburgh Steelers',
    away_team: 'Cleveland Browns',
    neutral: false,
    odds: -5,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Buffalo Bills',
    away_team: 'Miami Dolphins',
    neutral: false,
    odds: -3,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Tennessee Titans',
    away_team: 'Indianapolis Colts',
    neutral: false,
    odds: 3,
    over_under: 50,
    //kickoff that already happened
    kickoff: new Date('2024-11-13T01:00:00Z'),
  },
  {
    home_team: 'Baltimore Ravens',
    away_team: 'Cincinnati Bengals',
    neutral: false,
    odds: -10,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Los Angeles Chargers',
    away_team: 'Denver Broncos',
    neutral: false,
    odds: -3,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Atlanta Falcons',
    away_team: 'Carolina Panthers',
    neutral: false,
    odds: 3,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Detroit Lions',
    away_team: 'Chicago Bears',
    neutral: false,
    odds: 7,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'Houston Texans',
    away_team: 'Jacksonville Jaguars',
    neutral: false,
    odds: 10,
    over_under: 45,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
  {
    home_team: 'New England Patriots',
    away_team: 'New York Jets',
    neutral: false,
    odds: -7,
    over_under: 50,
    kickoff: new Date('2024-11-14T01:00:00Z'),
  },
];

const Page: React.FC<{
  params: {
    week: string;
    id: string;
  };
}> = ({ params: { week, id } }) => {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);

  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  //don't need allocated bets -> the choices will have acorresponding bet_id
  // that infers information about the bet being allocated or not
  const [choices, setChoices] = useState<Choice[]>([]);

  const handleBetSelection = (bet: Bet) => {
    setSelectedBet(bet);
    setSelectedGame(null);
  };

  //monitor changes to choices, selectedBet, selectedGame
  // if the selectedBet is not null, and the selectedGame is not null
  useEffect(() => {
    console.log('Selected Bet:', selectedBet);
    console.log('Selected Game:', selectedGame);
    console.log('Choices:', choices);
  }, [selectedBet, selectedGame, choices]);

  const modifyChoices = (choice: Choice) => {
    // if the choice is not for the selected bet, return the choice

    //find if there is a choice for the selected bet
    const existingChoice = choices.find(
      (choice) => choice.bet_id === selectedBet?.num_points
    );

    // if there is an existing choice, update it
    if (existingChoice) {
      setChoices(
        choices.map((choice) =>
          choice.bet_id === selectedBet?.num_points ? choice : choice
        )
      );
    } else {
      // if there is no existing choice, add the choice
      setChoices([...choices, choice]);
    }
  };

  const allocatedBets = useMemo(() => {
    const allocatedBets: Record<number, { bet: Bet; gameIndex: number }> = {};

    choices.forEach((choice) => {
      allocatedBets[choice.bet_id] = {
        bet: sampleBets[choice.bet_id],
        gameIndex: games.findIndex((game) => game === choice.game_id) as number,
      };
    });

    return allocatedBets;
  }, [choices]);

  /**
   *
   * @param betIndex
   * The ID of the bet
   * @param game
   * The game object you chose to allocate the bet to
   * @param selection
   * 1 for home team, 0 for road team for spread and moneyline
   * 1 for over, 0 for under for over_under
   */

  const handleGameSelection = (
    betIndex: number,
    game: Game,
    selection: number
  ) => {
    if ((selectedBet && new Date() < game.kickoff) || true) {
      // find if a choice already exists for this bet -> bet_id = betIndex

      modifyChoices({
        bet_id: betIndex,
        game_id: game,
        choice: selection as 0 | 1,
      });

      setSelectedBet(null);
      setSelectedGame(null);
    } else {
      console.log('Kickoff has already happened');
    }
  };

  const handleEditBet = (betIndex: number) => {
    const allocatedBet = allocatedBets[betIndex];
    if (allocatedBet) {
      setSelectedBet(allocatedBet.bet);
      setSelectedGame(allocatedBet.gameIndex);
    }
  };

  const gamesSelectedForTypeSpread: Game[] = useMemo(() => {
    //get all allocated Bets where the type is spread
    const spreadBets = Object.values(allocatedBets).filter(
      (allocatedBet) => allocatedBet?.bet.type === 'spread'
    );

    // get all the choices for which the bet_id corresponds to an index
    // in the allocatedBets array -> then don't show them

    const gameIndices = spreadBets.map(
      (allocatedBet) => allocatedBet?.gameIndex
    );

    // get all the games that are not in the gameIndices array
    // except the game corresponding to the selected bet

    //get index of selected bet in the bets array
    const selectedBetIndex = sampleBets.findIndex((bet) => bet === selectedBet);

    // get game corresponding to selected bet
    const game_index = choices.find(
      (choice) => choice.bet_id === selectedBetIndex
    )?.game_id;

    return games.filter(
      (game, index) => !gameIndices.includes(index) || index === selectedGame
    );
  }, [allocatedBets, choices, selectedBet, selectedGame]);

  const gamesSelectedForTypeOverUnder: Game[] = useMemo(() => {
    //get all allocated Bets where the type is spread
    const overUnderBets = Object.values(allocatedBets).filter(
      (allocatedBet) => allocatedBet?.bet.type === 'over_under'
    );

    // get all the choices for which the bet_id corresponds to an index
    // in the allocatedBets array -> then don't show them
    const gameIndices = overUnderBets.map(
      (allocatedBet) => allocatedBet?.gameIndex
    );

    // get all the games that are not in the gameIndices array
    return games.filter((game, index) => !gameIndices.includes(index));
  }, [allocatedBets]);

  const gamesSelectedForTypeMoneyline: Game[] = useMemo(() => {
    //get all allocated Bets where the type is spread
    const moneylineBets = Object.values(allocatedBets).filter(
      (allocatedBet) => allocatedBet?.bet.type === 'moneyline'
    );

    // get all the choices for which the bet_id corresponds to an index
    // in the allocatedBets array -> then don't show them
    const gameIndices = moneylineBets.map(
      (allocatedBet) => allocatedBet?.gameIndex
    );

    // get all the games that are not in the gameIndices array
    return games.filter((game, index) => !gameIndices.includes(index));
  }, [allocatedBets]);

  //bet editable -> for each bet -> has the game corresponding to the bet
  // been kickoff or not -> check the Choice object
  // if the game has been kickoff, then the bet is not editable
  const editableBets: boolean[] = useMemo(() => {
    const editableBets = sampleBets.map((bet, index) => {
      const choice = choices.find((choice) => choice.bet_id === index);
      if (choice) {
        return new Date() < choice.game_id.kickoff;
      } else {
        return true;
      }
    });

    return editableBets;
  }, [choices]);

  const gamesToMap = useMemo(() => {
    //get current type of selected bet
    if (selectedBet) {
      if (selectedBet.type === 'spread') {
        return gamesSelectedForTypeSpread;
      } else if (selectedBet.type === 'over_under') {
        return gamesSelectedForTypeOverUnder;
      } else {
        return gamesSelectedForTypeMoneyline;
      }
    } else {
      return [];
    }
  }, [
    selectedBet,
    gamesSelectedForTypeSpread,
    gamesSelectedForTypeOverUnder,
    gamesSelectedForTypeMoneyline,
  ]);

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-xl mb-4">Allocate Bets to Games</h1>
      <div className="w-full max-w-lg mb-4">
        <h2 className="text-lg mb-2">Available Bets</h2>
        <ul className="space-y-2">
          {sampleBets.map((bet, index) => (
            <li
              key={index}
              className={`p-2 border rounded cursor-pointer ${
                selectedBet === bet
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              } ${
                Object.values(allocatedBets).some(
                  (allocatedBet) => allocatedBet?.bet === bet
                )
                  ? 'opacity-50'
                  : ''
              }`}
              onClick={() => handleBetSelection(bet)}
            >
              {bet.type === 'spread'
                ? `Spread: ${bet.num_points}`
                : bet.type === 'over_under'
                ? `Over/Under: ${bet.num_points}`
                : 'Moneyline'}
              {Object.values(allocatedBets).some(
                (allocatedBet) => allocatedBet?.bet === bet
              ) && <span className="ml-2 text-green-500">✔</span>}
            </li>
          ))}
        </ul>
      </div>
      {selectedBet && (
        <div className="w-full max-w-lg mb-4">
          <h2 className="text-lg mb-2">Select Game for Bet</h2>
          <ul className="space-y-4">
            {gamesToMap.map((game, index) => (
              <li
                key={index}
                className={`p-4 border rounded ${
                  new Date() >= game.kickoff
                    ? 'bg-gray-800'
                    : 'bg-white dark:bg-gray-700 dark:text-white'
                }`}
              >
                <div>
                  <span>
                    {game.away_team} @ {game.home_team}
                  </span>
                  {selectedBet.type === 'spread' && (
                    <div className="flex gap-4 mt-2">
                      <button
                        //if there is already a choicef for this bet -> make it color blue
                        className={`p-2 border rounded
                          
                            ${
                              selectedGame === index &&
                              selectedBet &&
                              selectedBet.type === 'spread' &&
                              selectedBet.num_points > 0
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                            }
                          
                          ${
                            selectedGame === index &&
                            selectedBet &&
                            selectedBet.type === 'spread' &&
                            selectedBet.num_points > 0
                              ? 'bg-blue-500 text-white'
                              : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        onClick={() => {
                          //pass the index -> of the bet
                          //pass the game object
                          //pass the selection -> 1 for home team, 0 for road team
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          console.log('Index of Bet:', index_of_bet);
                          console.log('Game:', game);
                          console.log('Selection:', 1);
                          handleGameSelection(index_of_bet, game, 1);
                        }}
                      >
                        {game.home_team} (+{selectedBet.num_points})
                      </button>
                      <button
                        className={`p-2 border rounded ${
                          selectedGame === index &&
                          selectedBet &&
                          selectedBet.type === 'spread' &&
                          selectedBet.num_points < 0
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => {
                          //pass the index -> of the bet
                          //pass the game object
                          //pass the selection -> 1 for home team, 0 for road team
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 0);
                        }}
                      >
                        {game.away_team} (-{selectedBet.num_points})
                      </button>
                    </div>
                  )}
                  {selectedBet.type === 'over_under' && (
                    <div className="flex gap-4 mt-2">
                      <button
                        className={`p-2 border rounded ${
                          selectedGame === index &&
                          selectedBet &&
                          selectedBet.type === 'over_under' &&
                          selectedBet.num_points > 0
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => {
                          //pass the index -> of the bet
                          //pass the game object
                          //pass the selection -> 1 for over, 0 for under
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 1);
                        }}
                      >
                        Over ({game.over_under})
                      </button>
                      <button
                        className={`p-2 border rounded ${
                          selectedGame === index &&
                          selectedBet &&
                          selectedBet.type === 'over_under' &&
                          selectedBet.num_points < 0
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => {
                          //pass the index -> of the bet
                          //pass the game object
                          //pass the selection -> 1 for over, 0 for under
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 0);
                        }}
                      >
                        Under ({game.over_under})
                      </button>
                    </div>
                  )}
                  {selectedBet.type === 'moneyline' && (
                    <div className="flex gap-4 mt-2">
                      <button
                        className={`p-2 border rounded ${
                          selectedGame === index &&
                          selectedBet &&
                          selectedBet.type === 'moneyline' &&
                          selectedBet.num_points > 0
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => {
                          //pass the index -> of the bet
                          //pass the game object
                          //pass the selection -> 1 for home team, 0 for road team
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 1);
                        }}
                      >
                        {game.home_team} Moneyline
                      </button>
                      <button
                        className={`p-2 border rounded ${
                          selectedGame === index &&
                          selectedBet &&
                          selectedBet.type === 'moneyline' &&
                          selectedBet.num_points < 0
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => {
                          //pass the index -> of the bet
                          //pass the game object
                          //pass the selection -> 1 for home team, 0 for road team
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 0);
                        }}
                      >
                        {game.away_team} Moneyline
                      </button>
                    </div>
                  )}
                </div>
                {allocatedBets[selectedBet.num_points] && (
                  <button
                    className="p-2 bg-yellow-500 text-white rounded mt-2"
                    onClick={() => handleEditBet(selectedBet.num_points)}
                  >
                    Edit
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="w-full max-w-lg mt-4">
        <h2 className="text-lg mb-2">Summary of Selections</h2>
        <ul className="space-y-2">
          {Object.values(allocatedBets).map(
            (allocatedBet, index) =>
              allocatedBet && (
                <li
                  key={index}
                  className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-gray-200"
                >
                  <span>
                    Bet:{' '}
                    {allocatedBet.bet.type === 'spread'
                      ? `Spread: ${allocatedBet.bet.num_points}`
                      : allocatedBet.bet.type === 'over_under'
                      ? `Over/Under: ${allocatedBet.bet.num_points}`
                      : 'Moneyline'}{' '}
                    - Game: {games[allocatedBet.gameIndex].away_team} @{' '}
                    {games[allocatedBet.gameIndex].home_team} - Selection:{' '}
                    {allocatedBet.bet.num_points}. - Kickoff:{' '}
                    {games[allocatedBet.gameIndex].kickoff.toLocaleTimeString()}{' '}
                    -{' '}
                    {new Date() >= games[allocatedBet.gameIndex].kickoff
                      ? 'Kickoff happened'
                      : 'Kickoff not happened'}
                  </span>
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
};

export default Page;
