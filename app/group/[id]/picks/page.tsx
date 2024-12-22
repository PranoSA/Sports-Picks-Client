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
  FetchedGame,
  InsertionChoice,
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
import { useGetPicks, useAddPicks } from '../../../../queries/picks';

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
  const [choices, setChoices] = useState<InsertionChoice[]>([]);

  //on mount -> set the choices to the fetched choices
  const {
    data: picks,
    isLoading: picksLoading,
    isError: picksError,
  } = useGetPicks(id);

  const clearChoices = () => {
    setChoices([]);
  };

  //set choices to the picks when picks are fetched
  useEffect(() => {
    if (picks) {
      //turn picks into InsertionPicks
      const picks_made: InsertionChoice[] = picks.map((pick) => {
        return {
          bet_id: pick.bet_id,
          game_id: pick.game_id,
          pick: pick.pick,
        };
      });

      setChoices(picks_made);
    }
  }, [picks]);

  //set to dark mode
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

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

  const submitPicks = useAddPicks(id);

  const handleSubmission = () => {
    submitPicks.mutate(choices);
  };

  const handleBetSelection = (bet: Bet) => {
    setSelectedBet(bet);
    setSelectedGame(null);
  };

  const pendingPoints = useMemo(() => {
    //pending choices is games that are started but not finished
    const pendingChoices = choices.filter((choice) => {
      const game = games?.find((game) => game.game_id === choice.game_id);

      if (!game) {
        return false;
      }

      //return new Date() >= game.kickoff && !game.finished;
      return !game.finished;
    });

    return pendingChoices.reduce((acc, choice) => {
      const bet = sampleBets[choice.bet_id];
      return acc + bet.num_points;
    }, 0);
  }, [choices, games, sampleBets]);

  const missedPoints = useMemo(() => {
    //missed points are bets corresponding to games that have finished
    // and the choice was wrong
    const missedChoices = choices.filter((choice) => {
      const game = games?.find((game) => game.game_id === choice.game_id);

      if (!game) {
        return false;
      }

      if (!game.finished) {
        return false;
      }

      /**
       *
       * Basd on the bet type
       * OVER_UNDER? -> Did you choose 1 -> then is home.team_score + away.team_score > over_under?
       * Did you choose 0 -> then is home.team_score + away.team_score < over_under?
       * MONEYLINE? -> Did you choose the losing team?
       * SPREAD? -> Did you choose the correct team that covered the spread?
       */

      const bet_type = sampleBets[choice.bet_id].type;
      const bet_num_points = sampleBets[choice.bet_id].num_points;

      if (bet_type === 'spread') {
        //get the spread
        const spread = game.spread;

        if (choice.pick) {
          //home team
          return game.home_team_score - game.away_team_score <= spread;
        } else {
          //road team
          return game.away_team_score - game.home_team_score <= spread;
        }
      } else if (bet_type === 'over_under') {
        const over_under = game.over_under;

        if (choice.pick) {
          //over
          return game.home_team_score + game.away_team_score <= over_under;
        } else {
          //under
          return game.home_team_score + game.away_team_score >= over_under;
        }
      } else {
        //moneyline
        if (choice.pick) {
          //home team
          return game.home_team_score > game.away_team_score;
        } else {
          //road team
          return game.away_team_score > game.home_team_score;
        }
      }
    });

    return missedChoices.reduce((acc, choice) => {
      const bet = sampleBets[choice.bet_id];
      return acc + bet.num_points;
    }, 0);
  }, [choices, games, sampleBets]);

  const pointsScored = useMemo(() => {
    //get all the games that have finished
    const finishedGames = games?.filter((game) => game.finished);

    if (!finishedGames) {
      return 0;
    }

    //get all the choices that correspond to the finished gameschoice.
    const finishedChoices = choices.filter((choice) =>
      finishedGames.some((game) => game.game_id === choice.game_id)
    );

    //get all the bets that correspond to the finished games
    const finishedBets = finishedChoices.map(
      (choice) => sampleBets[choice.bet_id]
    );

    //get all the correct choices
    const correctChoices = finishedChoices.filter((choice) => {
      const game = finishedGames.find(
        (game) => game.game_id === choice.game_id
      );

      if (!game) {
        return false;
      }

      const bet = sampleBets[choice.bet_id];

      if (bet.type === 'spread') {
        const spread = game.spread;

        if (choice.pick) {
          //home team
          return game.home_team_score - game.away_team_score > spread;
        } else {
          //road team
          return game.away_team_score - game.home_team_score > spread;
        }
      } else if (bet.type === 'over_under') {
        const over_under = game.over_under;

        if (choice.pick) {
          //over
          return game.home_team_score + game.away_team_score > over_under;
        } else {
          //under
          return game.home_team_score + game.away_team_score < over_under;
        }
      } else {
        //moneyline
        if (choice.pick) {
          //home team
          return game.home_team_score > game.away_team_score;
        } else {
          //road team
          return game.away_team_score > game.home_team_score;
        }
      }
    });

    return correctChoices.reduce((acc, choice) => {
      const bet = sampleBets[choice.bet_id];
      return acc + bet.num_points;
    }, 0);
  }, [choices, games, sampleBets]);

  const modifyChoices = (pick: InsertionChoice) => {
    // if the choice is not for the selected bet, return the choice

    //find if there is a choice for the selected bet
    const existingChoice = choices.find(
      (choice) =>
        pick.bet_id === sampleBets.findIndex((bet) => bet === selectedBet)
    );

    // if there is an existing choice, update it
    if (existingChoice) {
      setChoices(
        choices.map((choice) =>
          pick.bet_id === sampleBets.findIndex((bet) => bet === selectedBet)
            ? choice
            : choice
        )
      );
    } else {
      // if there is no existing choice, add the choice
      setChoices([...(picks || []), pick]);
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
    //if game_index is -1 -> then the game has not been found
    //remove it from allocatedBets

    //filter out the games that have not been found
    Object.keys(allocatedBets).forEach((key) => {
      const numericKey = Number(key);
      if (allocatedBets[numericKey].gameIndex === -1) {
        //delete allocatedBets[numericKey];
      }
    });

    console.log('games', games);
    console.log('allocatedBets', allocatedBets);

    return allocatedBets;
  }, [choices, games, sampleBets]);

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

      const old_choices = choices;

      //modify the choice corresponding to the betIndex

      const index_of_choice = old_choices.findIndex(
        (choice) => choice.bet_id === betIndex
      );

      //modify the choice at that index with new selection and game_id
      if (index_of_choice !== -1) {
        const new_choice = {
          bet_id: betIndex,
          game_id: game.game_id,
          pick: selection === 1 ? true : false,
        };

        const new_choices = [
          ...old_choices.slice(0, index_of_choice),
          new_choice,
          ...old_choices.slice(index_of_choice + 1),
        ];

        setChoices(new_choices);
      } else {
        //add the choice to the choices
        setChoices([
          ...old_choices,
          {
            bet_id: betIndex,
            game_id: game.game_id,
            pick: selection === 1 ? true : false,
          },
        ]);
      }

      /*modifyChoices({
        bet_id: betIndex,
        game_id: game.game_id,
        pick: selection === 1 ? true : false,
      });*/

      setSelectedBet(null);
      setSelectedGame(null);
    } else {
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
  }, [allocatedBets, choices, games, sampleBets, selectedBet, selectedGame]);

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
  }, [allocatedBets, games]);

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
  }, [allocatedBets, games]);

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
  }, [choices, games, sampleBets]);

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

  const bet_statuses = useMemo(() => {
    const beStatus = (
      bet: Bet
    ): 'success' | 'fail' | 'in-progress' | 'hasnt-started' => {
      //find the corresponding choice

      const index_of_bet = sampleBets.findIndex(
        (sampleBet) => sampleBet === bet
      );

      const choice = choices.find((choice) => choice.bet_id === index_of_bet);

      if (!choice) {
        return 'hasnt-started';
      }

      //get the game corresponding to the choice
      const game = games?.find((game) => game.game_id === choice.game_id);

      if (!game) {
        return 'hasnt-started';
      }

      console.log('Game Kickoff', game.kickoff);
      console.log('Game Current Time', new Date());

      //check if the game has started
      if (new Date() >= game.kickoff) {
        console.log(game, 'is in progress');
        //check if game has been finished/scores
        if (game.finished) {
          //check th result of the game
          if (bet.type === 'spread') {
            const spread = game.spread;
            if (choice.pick) {
              return game.home_team_score - game.away_team_score > spread
                ? 'success'
                : 'fail';
            } else {
              return game.away_team_score - game.home_team_score > spread
                ? 'success'
                : 'fail';
            }
          }

          if (bet.type === 'over_under') {
            const over_under = game.over_under;
            return game.home_team_score + game.away_team_score > over_under
              ? 'success'
              : 'fail';
          }

          if (bet.type === 'moneyline') {
            if (choice.pick) {
              return game.home_team_score > game.away_team_score
                ? 'success'
                : 'fail';
            } else {
              return game.away_team_score > game.home_team_score
                ? 'success'
                : 'fail';
            }
          }
        }

        return 'in-progress';
      } else {
        return 'hasnt-started';
      }

      //if the game has started, then the bet is in progress
      //if the game has not started, then the bet hasnt started

      //for now -> since we don't have results yet -> just return in progress
    };
    return sampleBets.map((bet) => beStatus(bet));
  }, [choices, games, sampleBets]);

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
        {/* Submit your choices */}
        <button
          className="p-8 border rounded bg-blue-500 text-white"
          onClick={() => {
            handleSubmission();
          }}
        >
          Submit Choices
        </button>
        {/* Clear your choices */}
        <button
          className="p-8 border rounded bg-red-500 text-white"
          onClick={() => {
            clearChoices();
          }}
        >
          Clear Choices
        </button>
      </div>
      <div className="w-full max-w-lg mb-4">
        <h2 className="text-lg mb-2">Points</h2>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">
            Points Scored: {pointsScored}
          </span>
          <span className="text-lg font-semibold">
            Pending Points: {pendingPoints}
          </span>
          <span className="text-lg font-semibold">
            Missed Points: {missedPoints}
          </span>
        </div>
      </div>
      <div className="w-full max-w-lg mb-4">
        <h2 className="text-lg mb-2">Available Bets</h2>
        <ul className="space-y-2">
          {sampleBets.map((bet, index) => (
            <li
              key={index}
              className={`p-2 border rounded cursor-pointer ${
                selectedBet === bet
                  ? 'bg-blue-500 text-white'
                  : `${getStatusColor(bet_statuses[index])}`
              } ${
                Object.values(allocatedBets).some(
                  (allocatedBet) =>
                    allocatedBet?.bet === bet && allocatedBet.gameIndex !== -1
                )
                  ? 'opacity-50'
                  : ''
              }`}
              onClick={() => {
                //if the status is not "hasnt-started" -> don't allow the user to select the bet

                //log the game corresponding to the bet

                const choice = choices.find(
                  (choice) => choice.bet_id === index
                );

                const game = games.find(
                  (game) => game.game_id === choice?.game_id
                );

                console.log('Bet status', bet_statuses);

                //print corresponding game
                console.log('Game corresponding to bet', game);

                //print nicely formatted time in local time
                console.log('Kickoff time', game?.kickoff.toLocaleString());

                if (bet_statuses[index] !== 'hasnt-started') {
                  return;
                }

                handleBetSelection(bet);
              }}
            >
              {bet.type === 'spread'
                ? `Spread: ${bet.num_points}`
                : bet.type === 'over_under'
                ? `Over/Under: ${bet.num_points}`
                : `Moneyline : ${bet.num_points}`}
              {Object.values(allocatedBets).some(
                (allocatedBet) =>
                  allocatedBet?.bet === bet && allocatedBet.gameIndex !== -1
              ) && <span className="ml-2 text-green-500">✔</span>}
            </li>
          ))}
        </ul>
      </div>
      {selectedBet && (
        <div className="w-full max-w-lg mb-4">
          <div className="flex flex-col items-center">
            <h2 className="text-lg mb-2"> Current Selection :</h2>
            <span className="text-lg font-semibold">
              {selectedBet.type === 'spread'
                ? `Spread: ${selectedBet.num_points}`
                : selectedBet.type === 'over_under'
                ? `Over/Under: ${selectedBet.num_points}`
                : `Moneyline : ${selectedBet.num_points}`}
            </span>
            <div>
              {(() => {
                console.log('Selected Bet', selectedBet);
                const selectedBetIndex =
                  allocatedBets[
                    sampleBets.findIndex((bet) => bet === selectedBet)
                  ];
                console.log('Selected Bet Index', selectedBetIndex);
                const selectedGameIndex = selectedBetIndex?.gameIndex;
                const selectedGame = games[selectedGameIndex];
                return selectedGame ? (
                  <>
                    {selectedGame.home_team} @ {selectedGame.away_team}
                  </>
                ) : null;
              })()}
            </div>
          </div>

          <h2 className="text-lg mb-2">Select Game for Bet</h2>
          <ul className="space-y-4">
            {gamesToMap.map((game, index) => (
              <li
                key={index}
                className={`p-4 border rounded mb-4 ${
                  new Date() >= game.kickoff
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-gray-700 dark:text-white'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold mb-2">
                    {game.away_team} @ {game.home_team}
                  </span>
                  <div className="text-center mb-2">
                    {gameHasStarted(game) ? (
                      <span className="text-xl font-bold text-red-700">
                        Game has started
                      </span>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold">
                          {timeLefts[index].days}d {timeLefts[index].hours}h{' '}
                          {timeLefts[index].minutes}m {timeLefts[index].seconds}
                          s
                        </span>
                        <div className="text-sm">
                          <span>days</span> <span>hours</span>{' '}
                          <span>minutes</span> <span>seconds</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center mb-2">
                    <span>
                      Kickoff: {game.kickoff.toLocaleDateString()}{' '}
                      {game.kickoff.toLocaleTimeString()}
                    </span>
                  </div>
                  {selectedBet.type === 'spread' && (
                    <div className="flex gap-4 mt-2">
                      <button
                        className={`p-2 border rounded ${
                          selectedGame === index &&
                          selectedBet &&
                          selectedBet.type === 'spread' &&
                          selectedBet.num_points > 0
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => {
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            // return;
                          }
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 1);
                        }}
                      >
                        {game.home_team} {game.spread > 0 ? '+' : ''}
                        {game.spread}
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
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            //return;
                          }
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 0);
                        }}
                      >
                        {game.away_team} {game.spread < 0 ? '+' : '-'}
                        {Math.abs(game.spread)}
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
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            //return;
                          }
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
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            //return;
                          }
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
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            //return;
                          }
                          const index_of_bet = sampleBets.findIndex(
                            (bet) => bet === selectedBet
                          );
                          handleGameSelection(index_of_bet, game, 1);
                        }}
                      >
                        {game.home_team} Moneyline {game.moneyline}
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
                          if (new Date() >= game.kickoff) {
                            alert('Game has already started');
                            //return;
                          }
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
                    <GameDisplay
                      game={games[allocatedBet.gameIndex]}
                      bet={allocatedBet.bet}
                      pick={
                        choices.find(
                          (choice) =>
                            choice.bet_id ===
                            sampleBets.findIndex(
                              (bet) => bet === allocatedBet.bet
                            )
                        ) || { bet_id: -1, game_id: '', pick: false }
                      }
                    />
                  </span>
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
};

//create a nice looking game display component
/**
 *
 * If its finished -> show the scores
 * If its not finished -> show the kickoff time
 *
 *
 */

type GameDisplayProps = {
  game: FetchedGame;
  bet: Bet;
  pick: InsertionChoice;
};

const GameDisplay: React.FC<GameDisplayProps> = ({ game, bet, pick }) => {
  if (!game) {
    return <div>Game not found</div>;
  }

  const selectionString = (game: FetchedGame, bet: Bet) => {
    // check type
    if (bet.type === 'spread') {
      if (bet.num_points > 0) {
        return `${game.home_team} ${game.spread > 0 ? '+' : ''}${game.spread}`;
      } else {
        return `${game.away_team} ${game.spread < 0 ? '+' : '-'}${Math.abs(
          game.spread
        )}`;
      }
    } else if (bet.type === 'over_under') {
      if (bet.num_points > 0) {
        return `Over (${game.over_under})`;
      } else {
        return `Under (${game.over_under})`;
      }
    } else {
      if (bet.num_points > 0) {
        return `${game.home_team} Moneyline`;
      } else {
        return `${game.away_team} Moneyline`;
      }
    }
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex flex-col items-center">
        <span className="text-lg font-semibold mb-2">BET TYPE: {bet.type}</span>
        <span className="text-lg font-semibold mb-2">
          Bet Points : {bet.num_points}
        </span>
        <span className="text-lg font-semibold mb-2">
          Selection : {selectionString(game, bet)}:
        </span>

        <span className="text-lg font-semibold mb-2">
          {game.away_team} @ {game.home_team}
        </span>
        <div className="text-center mb-2">
          {game.finished ? (
            <>
              <span className="text-xl font-bold text-red-700">
                Game has finished
              </span>
              <div className="text-center mb-2">
                <span>
                  {game.away_team} {game.away_team_score} @ {game.home_team}{' '}
                  {game.home_team_score}
                </span>
              </div>
            </>
          ) : new Date() >= game.kickoff ? (
            <div>Pending ...</div>
          ) : (
            <div>
              <span className="text-2xl font-bold">
                {game.kickoff.toLocaleDateString()}{' '}
                {game.kickoff.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        <div className="text-center mb-2">
          <span>
            Kickoff: {game.kickoff.toLocaleDateString()}{' '}
            {game.kickoff.toLocaleTimeString()}
          </span>
        </div>
        {bet.type === 'spread' && (
          <div className="flex gap-4 mt-2">
            <button
              className={`p-2 border rounded ${
                pick.pick
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {game.home_team} {game.spread > 0 ? '+' : ''}
              {game.spread}
              {/* if selection was this one, place a checkmark or a x if correct/incorrect*/}
              {pick.pick &&
                (game.home_team_score - game.away_team_score > game.spread ? (
                  <span className="ml-2 text-green-500">✔</span>
                ) : (
                  <span className="ml-2 text-red-500">X</span>
                ))}
            </button>
            <button
              className={`p-2 border rounded ${
                pick.pick
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {game.away_team} {game.spread < 0 ? '+' : '-'}
              {Math.abs(game.spread)}
              {
                //if selection was this one, place a checkmark or a x if correct/incorrect
                pick.pick &&
                  (game.away_team_score - game.home_team_score > game.spread ? (
                    <span className="ml-2 text-green-500">✔</span>
                  ) : (
                    <span className="ml-2 text-red-500">X</span>
                  ))
              }
            </button>
          </div>
        )}
        {bet.type === 'over_under' && (
          <div className="flex gap-4 mt-2">
            <button
              className={`p-2 border rounded ${
                pick.pick
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Over ({game.over_under}){/* if bet is incorrect, place an X*/}
              {
                //if bet is correct, place a checkmark
              }
              {pick.pick &&
                (game.home_team_score + game.away_team_score >
                game.over_under ? (
                  <span className="ml-2 text-green-500">✔</span>
                ) : (
                  <span className="ml-2 text-red-500">X</span>
                ))}
            </button>
            <button
              className={`p-2 border rounded ${
                !pick.pick
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Under ({game.over_under})
              {!pick.pick &&
                (game.home_team_score + game.away_team_score <
                game.over_under ? (
                  <span className="ml-2 text-green-500">✔</span>
                ) : (
                  <span className="ml-2 text-red-500">X</span>
                ))}
            </button>
          </div>
        )}
        {bet.type === 'moneyline' && (
          <div className="flex gap-4 mt-2">
            <button
              className={`p-2 border rounded ${
                bet.num_points > 0
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {game.home_team} Moneyline
            </button>
            <button
              className={`p-2 border rounded ${
                bet.num_points < 0
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {game.away_team} Moneyline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageWithQueryProvider;
