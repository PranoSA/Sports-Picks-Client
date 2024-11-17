"use strict";
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
exports.__esModule = true;
