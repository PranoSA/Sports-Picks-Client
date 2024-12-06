'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 *
 * This Page the admin will use to set picks
 *
 */

import { useMemo, useState, useEffect } from 'react';

import {
  useGetGames,
  useAddGames,
  useDeleteGame,
  useSubmitScoreForGame,
} from '@/queries/games';

import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '@/queries/queryclient';

import '@/app/globals.css';
import { FetchedGame, InsertionGame } from '@/types/bets_and_odds';

// get param

/**
 * This component will help the admin quickly add games
 *
 */

const PageWithProvider = ({
  params,
}: {
  params: {
    year: string;
    week: string;
  };
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GamesPage params={params} />
    </QueryClientProvider>
  );
};

const GamesPage: React.FC<{
  params: {
    year: string;
    week: string;
  };
}> = ({ params: { week, year } }) => {
  const [newGame, setNewGame] = useState<InsertionGame>({
    home_team: '',
    away_team: '',
    neutral: false,
    spread: 1,
    over_under: 0,
    kickoff: new Date(),
    moneyline: 100,
    week_id: '',
    year_id: '',
  });

  const { data: games, isLoading, isError, error } = useGetGames(year, week);

  const submitScoreForGame = useSubmitScoreForGame();

  const addGame = () => {
    /*setGames([...games, newGame]);
    setNewGame({
      home_team: '',
      away_team: '',
      neutral: false,
      odds: 1,
      over_under: 0,
      kickoff: new Date(),
      moneyline: 100,
    });*/
  };

  const handleTimeChange = (field: string, value: string) => {
    const [hours, minutes, seconds] = [
      newGame.kickoff.getHours(),
      newGame.kickoff.getMinutes(),
      newGame.kickoff.getSeconds(),
    ];

    let newHours = hours;
    let newMinutes = minutes;
    let newSeconds = seconds;

    if (field === 'hours') {
      newHours = parseInt(value, 10);
    } else if (field === 'minutes') {
      newMinutes = parseInt(value, 10);
    } else if (field === 'seconds') {
      newSeconds = parseInt(value, 10);
    } else if (field === 'ampm') {
      if (value === 'AM' && newHours >= 12) {
        newHours -= 12;
      } else if (value === 'PM' && newHours < 12) {
        newHours += 12;
      }
    }

    setNewGame({
      ...newGame,
      kickoff: new Date(
        newGame.kickoff.setHours(newHours, newMinutes, newSeconds)
      ),
    });
  };

  //set to dark mode
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  const editGame = (index: number, updatedGame: FetchedGame) => {
    if (!games) {
      return;
    }

    const updatedGames = games.map((game, i) =>
      i === index ? updatedGame : game
    );
    //setGames(updatedGames);
  };

  //game-id
  const [gametoScore, setGameToScore] = useState<string | null>(null);
  const [home_team_score, setHomeTeamScore] = useState<number>(0);
  const [away_team_score, setAwayTeamScore] = useState<number>(0);
  const submitGameScore = (
    game_id: string,
    home_score: number,
    away_score: number
  ) => {
    submitScoreForGame.mutate({
      game_id,
      final_score: {
        home_score,
        away_score,
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: </div>;
  }

  if (!games) {
    return <div>No games found</div>;
  }

  const moneyLineString = (game: FetchedGame) => {
    {
      /* For Moneyline - write the moneyline score
                    
                      For positive moneyline - that means the home team is not the favorite

                      So if the home team wins, then it should output:

                      so if its +250, it means you get a 
                      350/100 = 3.5 times your bet

                      So this should output -> {game.home_team} - 350%

                      
                      If the road teams wins, it means you should output:

                      100/(350+100) = 0.2857

                      If its a negative moneyline - you should do the opposite
                      If the home team wins, you should output:

                      100/(abs(moneyline) + 100) = 0.2857

                      If the road team wins, you should output:

                      abs(moneyline)/100 = 3.5


                    */

      if (game.moneyline > 0) {
        // tell which team won
        if (game.home_team_score > game.away_team_score) {
          //if positive, means home team is not the favorite
          //so return should be greather than 1
          const moneyLineReturn = Math.round(game.moneyline);

          return `${game.home_team} - ${moneyLineReturn}%`;
        }
        if (game.away_team_score > game.home_team_score) {
          //if positive, means home team is not the favorite
          //so return should be greather than 1
          const moneyLineReturn = Math.round(
            (100 / (game.moneyline + 100)) * 100
          );

          return `${game.away_team} - ${moneyLineReturn}%`;
        }
      }
      if (game.moneyline < 0) {
        // tell which team won
        if (game.home_team_score > game.away_team_score) {
          //if negative, means home team is the favorite
          //so return should be less than 1
          const moneyLineReturn = Math.round(
            (100 / (Math.abs(game.moneyline) + 100)) * 100
          );

          return `${game.home_team} - ${moneyLineReturn}%`;
        }
        if (game.away_team_score > game.home_team_score) {
          //if negative, means home team is the favorit
          //so return should be less than 1
          const moneyLineReturn = Math.round(Math.abs(game.moneyline) + 100);

          return `${game.away_team} - ${moneyLineReturn}%`;
        }
      }
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <form
        className="w-full max-w-lg flex flex-col gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded shadow-md"
        onSubmit={(e) => {
          e.preventDefault();
          addGame();
        }}
      >
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="mb-2">Road Team</label>
            <input
              className="p-2 border rounded"
              type="text"
              placeholder="Road Team"
              value={newGame.away_team}
              onChange={(e) =>
                setNewGame({ ...newGame, away_team: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-center w-1/6">
            <h2>Vs.</h2>
          </div>
          <div className="flex flex-col w-1/2">
            <label className="mb-2">Home Team</label>
            <input
              className="p-2 border rounded"
              type="text"
              placeholder="Home Team"
              value={newGame.home_team}
              onChange={(e) =>
                setNewGame({ ...newGame, home_team: e.target.value })
              }
            />
          </div>
        </div>
        <label className="mb-2">Odds</label>
        <input
          className="p-2 border rounded dark:text-gray-800"
          type="number"
          placeholder="Odds"
          step={0.5}
          value={Math.abs(newGame.spread)}
          onChange={(e) =>
            setNewGame({ ...newGame, spread: parseFloat(e.target.value) })
          }
        />
        <label className="mb-2">Over/Under</label>
        <input
          className="p-2 border rounded dark:text-gray-800"
          type="number"
          placeholder="Over/Under"
          value={newGame.over_under}
          onChange={(e) =>
            setNewGame({ ...newGame, over_under: parseFloat(e.target.value) })
          }
        />
        {/* Here you set the moneyline
        It is driven by 2 inputs, depedent on each other
        So a changein one will change the other
        Change Home Team Moneyline - directly updates the game.moneyline
        Change Road Team Moneyline - it is not direct
        It is calculated by the formula
        away_team_moneyline = -1 * (moneyline * (odds / 100))
        */}
        <label className="mb-2">Home Team Moneyline</label>
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="mb-2">Home Team Moneyline</label>
            <input
              type="number"
              className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
              value={newGame.moneyline}
              onChange={(e) => {
                const homeTeamMoneyline = parseInt(e.target.value, 10);
                if (Math.abs(homeTeamMoneyline) > 100) {
                  setNewGame({
                    ...newGame,
                    moneyline: homeTeamMoneyline,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label className="mb-2">Road Team Moneyline</label>
            <input
              type="number"
              className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
              value={0 - newGame.moneyline}
              onChange={(e) => {
                console.log(e.target.value);

                const roadTeamMoneyline = parseInt(e.target.value, 10);
                if (Math.abs(roadTeamMoneyline) > 100) {
                  setNewGame({
                    ...newGame,
                    moneyline: -100 / (roadTeamMoneyline / 100),
                  });
                }
              }}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="favorite"
              value="road"
              checked={newGame.spread < 0}
              onChange={() =>
                setNewGame({ ...newGame, spread: -Math.abs(newGame.spread) })
              }
            />
            Road Team
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="favorite"
              value="home"
              checked={newGame.spread > 0}
              onChange={() =>
                setNewGame({ ...newGame, spread: Math.abs(newGame.spread) })
              }
            />
            Home Team
          </label>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="mb-2">Date</label>
            <input
              className="p-2 border rounded dark:text-gray-800"
              type="date"
              value={`${newGame.kickoff.getFullYear()}-${(
                newGame.kickoff.getMonth() + 1
              )
                .toString()
                .padStart(2, '0')}-${newGame.kickoff
                .getDate()
                .toString()
                .padStart(2, '0')}`}
              onChange={(e) => {
                const new_date = new Date(newGame.kickoff);
                const [year, month, day] = e.target.value.split('-');
                new_date.setFullYear(parseInt(year, 10));
                new_date.setMonth(parseInt(month, 10) - 1);
                new_date.setDate(parseInt(day, 10));
                setNewGame({
                  ...newGame,
                  kickoff: new_date,
                });
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">Hour</label>
            <input
              className="p-2 border rounded dark:text-gray-800"
              type="number"
              min="1"
              max="12"
              value={newGame.kickoff.getHours() % 12 || 12}
              onChange={(e) => handleTimeChange('hours', e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">Minute</label>
            <input
              className="p-2 border rounded dark:text-gray-800"
              type="number"
              min="0"
              max="59"
              step={1}
              value={newGame.kickoff.getMinutes()}
              onChange={(e) => handleTimeChange('minutes', e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">AM/PM</label>
            <select
              className="p-2 border rounded dark:text-gray-800"
              value={newGame.kickoff.getHours() < 12 ? 'AM' : 'PM'}
              onChange={(e) => handleTimeChange('ampm', e.target.value)}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <button className="p-2 bg-green-500 text-white rounded" type="submit">
          Add Game
        </button>
      </form>
      <h1 className="text-xl mb-4">
        Games for Week {week} of {year}
      </h1>
      <ul className="space-y-4 w-full max-w-lg">
        {games.map((game, index) => (
          <li
            key={index}
            className="p-4 border rounded flex justify-between items-center bg-white dark:bg-gray-800 shadow-md"
          >
            <div className="flex flex-col dark:bg-gray-800">
              <span className="text-lg font-semibold mb- 2">
                {game.away_team} @ {game.home_team}
              </span>
              <div className="mb-2">
                <span className="font-semibold">Odds:</span>
                <div>
                  {game.spread > 0
                    ? `${game.home_team} +${game.spread}`
                    : `${game.home_team} -${Math.abs(game.spread)}`}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Moneyline:</span>
                <div>{game.moneyline}</div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Kickoff:</span>
                <div>
                  {game.kickoff.toLocaleDateString()} @{' '}
                  {game.kickoff.toLocaleTimeString()}
                </div>
              </div>
              {!game.finished && (
                <div className="flex gap-2 mt-2">
                  <button
                    className="p-2 bg-yellow-500 text-white rounded"
                    onClick={() =>
                      editGame(index, {
                        ...game,
                        home_team: game.home_team,
                        away_team: game.away_team,
                        spread: parseFloat(
                          prompt('New odds:', game.spread.toString()) ||
                            game.spread.toString()
                        ),
                        over_under: parseFloat(
                          prompt(
                            'New over/under:',
                            game.over_under.toString()
                          ) || game.over_under.toString()
                        ),
                        moneyline: 0,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="p-2 bg-green-500 text-white rounded"
                    onClick={() => setGameToScore(game.game_id)}
                  >
                    Score
                  </button>
                </div>
              )}
              {game.finished && (
                <div className="mt-2">
                  <div className="text-green-500 dark:text-green-500">
                    <h2 className="font-semibold">Final Score</h2>
                    <button
                      className="p-2 bg-green-500 text-white rounded"
                      onClick={() => setGameToScore(game.game_id)}
                    >
                      Score
                    </button>
                    <div>
                      {game.home_team}: {game.home_team_score}
                    </div>
                    <div>
                      {game.away_team}: {game.away_team_score}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold">Odds:</span>
                    <div
                      //green text if the home team covered the spread
                      //this means if the home_team_score - spread > away_team_score
                      className={
                        game.home_team_score - game.spread >
                        game.away_team_score
                          ? 'text-green-500 dark:text-green-500'
                          : 'text-red-500 dark:text-red-500'
                      }
                    >
                      {game.spread > 0
                        ? `${game.home_team} +${game.spread}`
                        : `${game.home_team} -${Math.abs(game.spread)}`}
                    </div>
                    <div
                      //green text if the  road team covered the spread
                      //this means if the away_team_score + spread > home_team_score
                      className={
                        game.away_team_score + game.spread >
                        game.home_team_score
                          ? 'text-green-500 dark:text-green-500'
                          : 'text-red-500 dark:text-red-500'
                      }
                    >
                      {game.spread < 0
                        ? `${game.away_team} +${game.spread}`
                        : `${game.away_team} -${Math.abs(game.spread)}`}
                    </div>
                  </div>
                  <div className="mt-2">
                    {/* For Moneyline - write the moneyline score
                    
                      For positive moneyline - that means the home team is not the favorite

                      So if the home team wins, then it should output:

                      so if its +250, it means you get a 
                      350/100 = 3.5 times your bet

                      So this should output -> {game.home_team} - 350%

                      
                      If the road teams wins, it means you should output:

                      100/(350+100) = 0.2857

                      If its a negative moneyline - you should do the opposite
                      If the home team wins, you should output:

                      100/(abs(moneyline) + 100) = 0.2857

                      If the road team wins, you should output:

                      abs(moneyline)/100 = 3.5


                    */}
                    <span className="font-semibold">
                      <h2>Moneyline:</h2>
                      {moneyLineString(game)}
                    </span>
                    <div>{}</div>
                    {/* over under -
                    
                      should write Over or Under (made it)

                      */}
                    {game.home_team_score + game.away_team_score >
                    game.over_under ? (
                      <>
                        <div className="text-green-500 dark:text-green-500">
                          Over - {game.home_team_score + game.away_team_score} /{' '}
                          {game.over_under}
                        </div>
                        <div className="text-red-500 dark:text-red-500">
                          Under - {game.home_team_score + game.away_team_score}{' '}
                          / {game.over_under}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-red-500 dark:text-red-500">
                          Over - {game.home_team_score + game.away_team_score} /{' '}
                          {game.over_under}
                        </div>
                        <div className="text-green-500 dark:text-green-500">
                          Under - {game.home_team_score + game.away_team_score}{' '}
                          / {game.over_under}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {gametoScore === game.game_id && (
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Home Score"
                  step={1}
                  min={0}
                  className="dark:text-gray-800"
                  value={home_team_score}
                  onChange={(e) => {
                    setHomeTeamScore(parseInt(e.target.value, 10));
                  }}
                />
                <input
                  type="number"
                  step={1}
                  min={0}
                  placeholder="Away Score"
                  className="dark:text-gray-800"
                  value={away_team_score}
                  onChange={(e) => {
                    setAwayTeamScore(parseInt(e.target.value, 10));
                  }}
                />
                <button
                  className="p-2 bg-green-500 text-white rounded"
                  onClick={() => {
                    submitGameScore(
                      game.game_id,
                      home_team_score,
                      away_team_score
                    );

                    setGameToScore(null);
                    setHomeTeamScore(0);
                    setAwayTeamScore(0);
                  }}
                >
                  Submit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageWithProvider;
