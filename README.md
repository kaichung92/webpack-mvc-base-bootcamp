# Rocket Academy Coding Bootcamp: Webpack MVC Base

project 3 - heads up poker
a poker app thats focus on inproving your heads up game
game will be 1 on 1, player will start with the same amount of chip
player can only
-check
-call
-fold
(turn ends when the last player check, call or fold)

-raise 2x, 3x, 4x, all in (unable to choose the amount)

---------[login-page]------------
need to have account to play, create account

- can register over here

---------[lobby]------------
where all the on going games will appear

- player have to create a room or join a room to start a match
  matches will only be 1 on 1
- will have multiple games going on, each game only can have 2 players

---------[settings]------------
host/creator of the room will be able to edit some of the settings

- players will each start with 100bb
- time limit for each hand
- set password for private game
- no password for public gme

---------[gameplay]------------
there will be 4 turns of betting, pre flop, flop, turn and river

only 3 options for player to select.

- check/fold,
- call
- raise

1. pre flop

- the first to act will start with the small blind and have the dealer button
  optioons will be raise, fold or call
- the second to act will start with the big blind and if the action to pass to him, he can either
  checked to him -> options will be check or raise
  raised to him -> options will be fold, call or raise
- turn will only end if last player checked, last player call, or either player fold

2. flop/river/turn

- bb will start the bet, either check or raise
- dealer turn to act
  checked to him -> check or raise
  raised to him -> call, fold or raise
- counter will plus 1 for every successful turns, 1-preflop, 2-flop, 3-river 4-turn
  show down when counter reaches 4
  or ends when either one fold

game will end when either one of the player reaches 0 chip
winner will be credited with one point and loser minus one point

- can have a global point to view
- able to see history hands played
