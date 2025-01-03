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
  start_date: Date;
  end_date: Date;
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
  finished: boolean;
  home_team_score: number;
  away_team_score: number;
};

type Group = {
  group_name: string;
  year: string;
  bets: Bet[];
};

type InsertionGroup = {
  group_name: string;

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

type FetchedGroup_User = {
  group_id: string;
  user_id: string;
  user_name: string;
  position: 'admin' | 'member';
};

type JoinGroup = {
  group_id: string;
  passcode: string;
};

type Bet = {
  type: 'spread' | 'over_under' | 'moneyline';
  num_points: number;
};

type Choice = {
  bet_id: number;
  game_id: string;
  username?: string;
  userId?: string;
  //choice will be 0 for road team, 1 for home team
  // or 0 for under, 1 for over
  // or 0 for loss, 1 for win
  choice: 0 | 1;
};

/*
    .createTable(TableNames.Pick_Table, (table) => {
      table
        .uuid(PickTableColumns.pick_id)
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));
      table.integer(PickTableColumns.bet_id).notNullable();
      table.uuid(PickTableColumns.game_id).notNullable();
      table.uuid(PickTableColumns.user_id).notNullable();

      table.boolean(PickTableColumns.pick).notNullable();
      //BET ID IS NOT!!!!!!!!!! A FOREIGN KEY
      table
        .foreign(PickTableColumns.game_id)
        .references(`${TableNames.Game_Table}.${GameTableColumns.game_id}`);
    })
        */

type InsertionChoice = {
  bet_id: number; //index of the bet in the group
  game_id: string;
  pick: boolean;
};

type FetchedChoice = {
  pick_id: string;
  bet_id: number;
  game_id: string;
  username: string;
  pick: boolean;
};

/*
[
    [
        {
            "week": "2024-12-11T00:00:00.000Z-2024-12-17T23:59:59.000Z",
            "user_id": "4d15cb58-ad43-454d-b8d6-0409f6bea8af",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2024-12-11T00:00:00.000Z-2024-12-17T23:59:59.000Z",
            "user_id": "6a17d982-e464-4dc5-b7f7-ab30dd7bad08",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2024-12-11T00:00:00.000Z-2024-12-17T23:59:59.000Z",
            "user_id": "ee303ae8-afb0-445d-8066-2910198a0a56",
            "score": 0,
            "potential": 0
        }
    ],
    [
        {
            "week": "2024-12-18T00:00:00.000Z-2024-12-24T23:59:59.000Z",
            "user_id": "4d15cb58-ad43-454d-b8d6-0409f6bea8af",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2024-12-18T00:00:00.000Z-2024-12-24T23:59:59.000Z",
            "user_id": "6a17d982-e464-4dc5-b7f7-ab30dd7bad08",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2024-12-18T00:00:00.000Z-2024-12-24T23:59:59.000Z",
            "user_id": "ee303ae8-afb0-445d-8066-2910198a0a56",
            "score": 0,
            "potential": 0
        }
    ],
    [
        {
            "week": "2024-12-25T00:00:00.000Z-2024-12-31T23:59:59.000Z",
            "user_id": "4d15cb58-ad43-454d-b8d6-0409f6bea8af",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2024-12-25T00:00:00.000Z-2024-12-31T23:59:59.000Z",
            "user_id": "6a17d982-e464-4dc5-b7f7-ab30dd7bad08",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2024-12-25T00:00:00.000Z-2024-12-31T23:59:59.000Z",
            "user_id": "ee303ae8-afb0-445d-8066-2910198a0a56",
            "score": 0,
            "potential": 0
        }
    ],
    [
        {
            "week": "2025-01-01T00:00:00.000Z-2025-01-07T23:59:59.000Z",
            "user_id": "4d15cb58-ad43-454d-b8d6-0409f6bea8af",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2025-01-01T00:00:00.000Z-2025-01-07T23:59:59.000Z",
            "user_id": "6a17d982-e464-4dc5-b7f7-ab30dd7bad08",
            "score": 0,
            "potential": 0
        },
        {
            "week": "2025-01-01T00:00:00.000Z-2025-01-07T23:59:59.000Z",
            "user_id": "ee303ae8-afb0-445d-8066-2910198a0a56",
            "score": 0,
            "potential": 0
        }
    ]
]
    */

type UserScore = {
  week: string;
  user_id: string;
  score: number;
  potential: number;
};

type WeekScores = UserScore[];

type AllScores = WeekScores[];

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
  FetchedGroup_User,
  InsertionGroup_User,
  JoinGroup,
  Bet,
  Choice,
  InsertionChoice,
  FetchedChoice,
  UserScore,
  WeekScores,
  AllScores,
};
