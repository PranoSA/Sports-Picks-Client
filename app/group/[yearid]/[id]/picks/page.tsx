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
  FetchedGame,
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
const PageWithQueryProvider: React.FC<{
  params: { week: string; id: string };
}> = ({ params }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Page params={params} />
    </QueryClientProvider>
  );
};

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

  const {
    data: games,
    isLoading: gamesLoading,
    isError: gamesError,
  } = useGetCurrentWeekGames();

  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
  } = useGetGroupById(id);

  const sampleBets: Bet[] = useMemo(() => {
    if (!group) {
      return [];
    }
    return group.bets;
  }, [group]);

  const handleBetSelection = (bet: Bet) => {
    setSelectedBet(bet);
    setSelectedGame(null);
  };

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

    if (!games) {
      return allocatedBets;
    }

    choices.forEach((choice) => {
      allocatedBets[choice.bet_id] = {
        bet: sampleBets[choice.bet_id],
        gameIndex: games.findIndex(
          (game) => game.game_id === choice.game_id
        ) as number,
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
    game: FetchedGame,
    selection: number
  ) => {
    if ((selectedBet && new Date() < game.kickoff) || true) {
      // find if a choice already exists for this bet -> bet_id = betIndex

      modifyChoices({
        bet_id: betIndex,
        game_id: game.game_id,
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

  const gamesSelectedForTypeSpread: FetchedGame[] = useMemo(() => {
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

    if (!games) {
      return [];
    }

    return games.filter(
      (game, index) => !gameIndices.includes(index) || index === selectedGame
    );
  }, [allocatedBets, choices, selectedBet, selectedGame]);

  const gamesSelectedForTypeOverUnder: FetchedGame[] = useMemo(() => {
    //get all allocated Bets where the type is spread
    const overUnderBets = Object.values(allocatedBets).filter(
      (allocatedBet) => allocatedBet?.bet.type === 'over_under'
    );

    // get all the choices for which the bet_id corresponds to an index
    // in the allocatedBets array -> then don't show them
    const gameIndices = overUnderBets.map(
      (allocatedBet) => allocatedBet?.gameIndex
    );
    if (!games) {
      return [];
    }
    // get all the games that are not in the gameIndices array
    return games.filter((game, index) => !gameIndices.includes(index));
  }, [allocatedBets]);

  const gamesSelectedForTypeMoneyline: FetchedGame[] = useMemo(() => {
    //get all allocated Bets where the type is spread
    const moneylineBets = Object.values(allocatedBets).filter(
      (allocatedBet) => allocatedBet?.bet.type === 'moneyline'
    );

    // get all the choices for which the bet_id corresponds to an index
    // in the allocatedBets array -> then don't show them
    const gameIndices = moneylineBets.map(
      (allocatedBet) => allocatedBet?.gameIndex
    );

    if (!games) {
      return [];
    }

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
        //get game corresponding to the choice
        const game = games?.find((game) => game.game_id === choice.game_id);

        // would have no idea why this would ever happen
        if (!game) {
          return true;
        }

        return new Date() < game?.kickoff;
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

  const gameHasStarted = (game: FetchedGame) => {
    return new Date() >= game.kickoff;
  };

  //  run a counter that sets the days, hours, minutes, and seconds
  // until the game starts
  type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };

  const [timer, setTimer] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  //create a list of timelefts corresponding to each game
  // and call it every second
  const timeLefts: TimeLeft[] = useMemo(() => {
    if (!games) {
      return [];
    }

    const timeLefts = gamesToMap.map((game) => {
      const timeLeft = game.kickoff.getTime() - timer.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    });
    return timeLefts;
  }, [games, gamesToMap, timer]);

  const beStatus = (
    bet: Bet
  ): 'success' | 'fail' | 'in-progress' | 'hasnt-started' => {
    //find the corresponding choice
    const choice = choices.find((choice) => choice.bet_id === bet.num_points);

    if (!choice) {
      return 'hasnt-started';
    }

    //get the game corresponding to the choice
    const game = games?.find((game) => game.game_id === choice.game_id);

    if (!game) {
      return 'hasnt-started';
    }

    //check if the game has started
    if (new Date() >= game.kickoff) {
      return 'in-progress';
    } else {
      return 'hasnt-started';
    }

    //if the game has started, then the bet is in progress
    //if the game has not started, then the bet hasnt started

    //for now -> since we don't have results yet -> just return in progress
  };

  if (gamesLoading || groupLoading) {
    return <div>Loading...</div>;
  }

  if (gamesError || groupError) {
    return <div>Error...</div>;
  }

  if (!games || !group) {
    return <div>Not found...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-500 text-black';
      case 'failed':
        return 'bg-gray-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-white dark:bg-gray-700 dark:text-gray-200';
    }
  };

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
                  : `${getStatusColor(beStatus(bet))}`
              } ${
                Object.values(allocatedBets).some(
                  (allocatedBet) => allocatedBet?.bet === bet
                )
                  ? 'opacity-50'
                  : ''
              }`}
              onClick={() => {
                //if the status is not "hasnt-started" -> don't allow the user to select the bet
                if (beStatus(bet) !== 'hasnt-started') {
                  return;
                }

                handleBetSelection(bet);
              }}
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
                  {/* Timer Logic */}
                  <span>
                    {gameHasStarted(game)
                      ? 'Game has started'
                      : `${timeLefts[index].days} days, ${timeLefts[index].hours} hours, ${timeLefts[index].minutes} minutes, ${timeLefts[index].seconds} seconds until kickoff`}
                  </span>
                </div>
                <div>
                  {/* Kickoff time */}
                  <span>
                    Kickoff: {game.kickoff.toLocaleDateString()}
                    {game.kickoff.toLocaleTimeString()}
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
                          //check if the game has started
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            return;
                          }

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

export default PageWithQueryProvider;
