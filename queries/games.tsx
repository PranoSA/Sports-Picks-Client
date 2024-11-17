import {
  useQuery,
  useMutation,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import queryClient from './queryclient';
import { InsertionGame, FetchedGame } from '../types/bets_and_odds';
/**
 *
 * Another TRIO of the ADMIN level queries
 *
 *
 */

//you fetch games by [year_id, week_id]

const create_game_key = (year_id: string, week_id: string) => [
  'games',
  year_id,
  week_id,
];

const getGames = async (year_id: string, week_id: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/games/${year_id}/${week_id}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  type GameResponse = FetchedGame & { kickoff: string };

  const data: GameResponse[] = await res.json();

  return data.map((game) => {
    return {
      ...game,
      kickoff: new Date(game.kickoff),
    };
  });
};

//use Query
export const useGetGames = (
  year_id: string,
  week_id: string
): UseQueryResult<FetchedGame[], unknown> => {
  return useQuery({
    queryKey: create_game_key(year_id, week_id),
    queryFn: async () => {
      const new_games = await getGames(year_id, week_id);
      return new_games;
    },
  });
};

const addGames = async (games: InsertionGame[]) => {
  const url: string = `${process.env.NEXT_PUBLIC_API_URL}/games`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(games),
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  return res.json();
};

export const useAddGames = (): UseMutationResult<
  InsertionGame[],
  unknown,
  InsertionGame[],
  unknown
> => {
  return useMutation({
    mutationFn: async (games: InsertionGame[]) => {
      const new_games = await addGames(games);
      return games;
    },
    onSuccess: (newGames) => {
      const old_games = queryClient.getQueryData<FetchedGame[]>(
        create_game_key(newGames[0].year_id, newGames[0].week_id)
      );

      if (!old_games) {
        return;
      }

      const games_now = [...old_games, ...newGames];

      queryClient.setQueryData(
        create_game_key(newGames[0].year_id, newGames[0].week_id),
        games_now
      );
    },
  });
};

//delete games by game_id
const deleteGame = async (game_id: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/games/${game_id}`;

  const res = await fetch(url, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  return res.json();
};

export const useDeleteGame = (): UseMutationResult<
  FetchedGame,
  unknown,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: async (game_id: string) => {
      const deleted_game = await deleteGame(game_id);
      return deleted_game;
    },
    onSuccess: (deletedGame) => {
      const old_games = queryClient.getQueryData<FetchedGame[]>(
        create_game_key(deletedGame.year_id, deletedGame.week_id)
      );

      if (!old_games) {
        return;
      }

      const games_now = old_games.filter(
        (game) => game.game_id !== deletedGame.game_id
      );

      queryClient.setQueryData(
        create_game_key(deletedGame.year_id, deletedGame.week_id),
        games_now
      );
    },
  });
};

const getCurrentWeekGames = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/games/current`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  type GameResponse = FetchedGame & { kickoff: string };

  const data: GameResponse[] = await res.json();

  return data.map((game) => {
    return {
      ...game,
      kickoff: new Date(game.kickoff),
    };
  });
};

export const useGetCurrentWeekGames = (): UseQueryResult<
  FetchedGame[],
  unknown
> => {
  return useQuery({
    queryKey: ['current_week_games'],
    queryFn: getCurrentWeekGames,
  });
};
