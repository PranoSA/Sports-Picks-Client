/* eslint-disable @typescript-eslint/no-unused-vars */
/*


Bets and Odds Types

1. The Administrator can create a new year and week
2. The Administrator can add a new game to the week
3. The Administrator can add a new bet to the game
[This will be of multiple types, such as "spread", "over/under", "moneyline"]
4. A Group Administrator Can Create a New Group
This Group will correspond to a Year of Games
Each Year Requires a New Group
5. Invites Can Be Sent to Users
6.
Inside the Group , each user can make a pick for each game
for each week

7. The Group Will have choices like this:
{
bets : {
type: "spread",
num_points: 10, // how many points this bet is worth
game_id: 1, // the game this bet is for
}
}

This will correspond to the Entire Year of Games
It can not be changed once the year has started

8. Each Week, a User makes picks for each game
The user can make a pick corresponding to each bet type
Once the kickoff time has passed, the user can not change their pick
So if the 10 point game has started, the user can not change their 10 point pick

*/

type Year = {
  year: string;
  weeks: Week[];
};

type InsertionYear = {
  year_id: string;
  start_date: Date;
  end_date: Date;
};

type FetchedYear = {
  year_id: string;
  start_date: string;
  end_date: string;
};

type Week = {
  start: Date;
  end: Date;
  nickname: string; //Could be like "Week 1" or "Wildcard Round"
};

type InsertionWeek = {
  year_id: string;
  week_id: string;
  start_date: Date;
  end_date: Date;
  week_name: string;
};

type FetchedWeek = {
  week_id: string;
  year_id: string;
  start_date: Date;
  end_date: Date;
  week_name: string;
};

interface GameOdds {
  year: string;
  week: string;
  games: Game[];
}

interface Game {
  home_team: string;
  away_team: string;
  neutral: boolean;
  odds: number; // negative for road_team, + for home_team
  over_under: number;
  kickoff: Date;
}

type InsertionGame = {
  week_id: string;
  year_id: string;
  home_team: string;
  away_team: string;
  neutral: boolean;
  spread: number;
  over_under: number;
  moneyline: number;
  kickoff: Date;
};

//fetch game has a game_id
type FetchedGame = {
  game_id: string;
  week_id: string;
  year_id: string;
  home_team: string;
  away_team: string;
  neutral: boolean;
  spread: number;
  over_under: number;
  moneyline: number;
  kickoff: Date;
};

type Group = {
  group_name: string;
  year: string;
  bets: Bet[];
};

type InsertionGroup = {
  group_name: string;
  year_id: string;
  bets: Bet[];
};

type FetchedGroup = {
  group_id: string;
  group_name: string;
  year_id: string;
  bets: Bet[];
};

type Group_User = {
  group_id: string;
  user_id: string;
  user_name: string;
  position: 'admin' | 'member';
};

type InsertionGroup_User = {
  group_id: string;
  user_id: string;
  user_name: string;
  position: 'admin' | 'member';
};

type Bet = {
  type: 'spread' | 'over_under' | 'moneyline';
  num_points: number;
};

type Choice = {
  bet_id: number;
  game_id: Game;
  username?: string;
  userId?: string;
  //choice will be 0 for road team, 1 for home team
  // or 0 for under, 1 for over
  // or 0 for loss, 1 for win
  choice: 0 | 1;
};

type InsertionChoice = {
  bet_id: number;
  game_id: number;
  username: string;
  choice: 0 | 1;
};

type FetchedChoice = {
  choice_id: string;
  bet_id: number;
  game_id: number;
  username: string;
  choice: 0 | 1;
};

export type {
  Year,
  InsertionYear,
  FetchedYear,
  Week,
  InsertionWeek,
  FetchedWeek,
  GameOdds,
  Game,
  InsertionGame,
  FetchedGame,
  Group,
  FetchedGroup,
  InsertionGroup,
  Bet,
  Choice,
};
