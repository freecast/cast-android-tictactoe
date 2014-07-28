/**
 * Copyright (C) 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Tic Tac Toe Gameplay with Chromecast
 * This file exposes cast.TicTacToe as an object containing a
 * CastMessageBus and capable of receiving and sending messages
 * to the sender application.
 */

// External namespace for cast specific javascript library
var cast = window.cast || {};

// Anonymous namespace
(function() {
  'use strict';

  TicTacToe.PROTOCOL = 'urn:x-cast:com.google.cast.demo.tictactoe';

  TicTacToe.PLAYER = {
    O: 'O',
    X: 'X'
  };

  /**
   * Creates a TicTacToe object.
   * @param {board} board an optional game board.
   * @constructor
   */
  function TicTacToe(board) {
    this.mBoard = board;
    this.mPlayer1 = -1;
    this.mPlayer2 = -1;
    this.mCurrentPlayer;

    console.log('********TicTacToe********');
    this.castReceiverManager_ = cast.receiver.CastReceiverManager.getInstance();
    this.castMessageBus_ =
        this.castReceiverManager_.getCastMessageBus(TicTacToe.PROTOCOL,
        cast.receiver.CastMessageBus.MessageType.JSON);
    this.castMessageBus_.onMessage = this.onMessage.bind(this);
    this.castReceiverManager_.onSenderConnected =
        this.onSenderConnected.bind(this);
    this.castReceiverManager_.onSenderDisconnected =
        this.onSenderDisconnected.bind(this);
    this.castReceiverManager_.start();
  }


  // Adds event listening functions to TicTacToe.prototype.
  TicTacToe.prototype = {

    /**
     * Sender Connected event
     * @param {event} event the sender connected event.
     */
    onSenderConnected: function(event) {
      console.log('onSenderConnected. Total number of senders: ' +
          this.castReceiverManager_.getSenders().length);
    },

    /**
     * Sender disconnected event; if all senders are disconnected,
     * closes the application.
     * @param {event} event the sender disconnected event.
     */
    onSenderDisconnected: function(event) {
      console.log('onSenderDisconnected. Total number of senders: ' +
          this.castReceiverManager_.getSenders().length);

      if (this.castReceiverManager_.getSenders().length == 0) {
        window.close();
      }
    },

    /**
     * Message received event; determines event message and command, and
     * choose function to call based on them.
     * @param {event} event the event to be processed.
     */
    onMessage: function(event) {
      var message = event.data;
      var senderId = event.senderId;
      console.log('********onMessage********' + JSON.stringify(event.data));
      console.log('mPlayer1: ' + this.mPlayer1);
      console.log('mPlayer2: ' + this.mPlayer2);

      if (message.command == 'join') {
        this.onJoin(senderId, message);
      } else if (message.command == 'leave') {
        this.onLeave(senderId);
      } else if (message.command == 'move') {
        this.onMove(senderId, message);
      } else if (message.command == 'board_layout_request') {
        this.onBoardLayoutRequest(senderId);
      } else {
        console.log('Invalid message command: ' + message.command);
      }
    },

    /**
     * Player joined event: registers a new player who joined the game, or
     * prevents player from joining if invalid.
     * @param {string} senderId the sender the message came from.
     * @param {Object|string} message the name of the player who just joined.
     */
    onJoin: function(senderId, message) {
      console.log('****onJoin****');

      if ((this.mPlayer1 != -1) &&
          (this.mPlayer1.senderId == senderId)) {
        this.sendError(senderId, 'You are already ' +
                       this.mPlayer1.player +
                       ' You aren\'t allowed to play against yourself.');
        return;
      }
      if ((this.mPlayer2 != -1) &&
          (this.mPlayer2.senderId == senderId)) {
        this.sendError(senderId, 'You are already ' +
                       this.mPlayer2.player +
                       ' You aren\'t allowed to play against yourself.');
        return;
      }

      if (this.mPlayer1 == -1) {
        this.mPlayer1 = new Object();
        this.mPlayer1.name = message.name;
        this.mPlayer1.senderId = senderId;
      } else if (this.mPlayer2 == -1) {
        this.mPlayer2 = new Object();
        this.mPlayer2.name = message.name;
        this.mPlayer2.senderId = senderId;
      } else {
        console.log('Unable to join a full game.');
        this.sendError(senderId, 'Game is full.');
        return;
      }

      console.log('mPlayer1: ' + this.mPlayer1);
      console.log('mPlayer2: ' + this.mPlayer2);

      if (this.mPlayer1 != -1 && this.mPlayer2 != -1) {
        this.mBoard.reset();
        this.startGame_();
      }
    },

    /**
     * Player leave event: determines which player left and unregisters that
     * player, and ends the game if all players are absent.
     * @param {string} senderId the sender ID of the leaving player.
     */
    onLeave: function(senderId) {
      console.log('****OnLeave****');

      if (this.mPlayer1 != -1 && this.mPlayer1.senderId == senderId) {
        this.mPlayer1 = -1;
      } else if (this.mPlayer2 != -1 && this.mPlayer2.senderId == senderId) {
        this.mPlayer2 = -1;
      } else {
        console.log('Neither player left the game');
        return;
      }
      console.log('mBoard.GameResult: ' + this.mBoard.getGameResult());
      if (this.mBoard.getGameResult() == -1) {
        this.mBoard.setGameAbandoned();
        this.broadcastEndGame(this.mBoard.getGameResult());
      }
    },

    /**
     * Move event: checks whether a valid move was made and updates the board
     * as necessary.
     * @param {string} senderId the sender that made the move.
     * @param {Object|string} message contains the row and column of the move.
     */
    onMove: function(senderId, message) {
      console.log('****onMove****');
      var isMoveValid;

      if ((this.mPlayer1 == -1) || (this.mPlayer2 == -1)) {
        console.log('Looks like one of the players is not there');
        console.log('mPlayer1: ' + this.mPlayer1);
        console.log('mPlayer2: ' + this.mPlayer2);
        return;
      }

      if (this.mPlayer1.senderId == senderId) {
        if (this.mPlayer1.player == this.mCurrentPlayer) {
          if (this.mPlayer1.player == TicTacToe.PLAYER.X) {
            isMoveValid = this.mBoard.drawCross(message.row, message.column);
          } else {
            isMoveValid = this.mBoard.drawNaught(message.row, message.column);
          }
        } else {
          console.log('Ignoring the move. It\'s not your turn.');
          this.sendError(senderId, 'It\'s not your turn.');
          return;
        }
      } else if (this.mPlayer2.senderId == senderId) {
        if (this.mPlayer2.player == this.mCurrentPlayer) {
          if (this.mPlayer2.player == TicTacToe.PLAYER.X) {
            isMoveValid = this.mBoard.drawCross(message.row, message.column);
          } else {
            isMoveValid = this.mBoard.drawNaught(message.row, message.column);
          }
        } else {
          console.log('Ignoring the move. It\'s not your turn.');
          this.sendError(senderId, 'It\'s not your turn.');
          return;
        }
      } else {
        console.log('Ignorning message. Someone other than the current' +
            'players sent a move.');
        this.sendError(senderId, 'You are not playing the game');
        return;
      }

      if (isMoveValid === false) {
        this.sendError(senderId, 'Your last move was invalid');
        return;
      }

      var isGameOver = this.mBoard.isGameOver();
      this.broadcast({
        event: 'moved',
        player: this.mCurrentPlayer,
        row: message.row,
        column: message.column,
        game_over: isGameOver });

      console.log('isGameOver: ' + isGameOver);
      console.log('winningLoc: ' + this.mBoard.getWinningLocation());

      // When the game should end
      if (isGameOver == true) {
        this.broadcastEndGame(this.mBoard.getGameResult(),
            this.mBoard.getWinningLocation());
      }
      // Switch current player
      this.mCurrentPlayer = (this.mCurrentPlayer == TicTacToe.PLAYER.X) ?
          TicTacToe.PLAYER.O : TicTacToe.PLAYER.X;
    },

    /**
     * Request event for the board layout: sends the current layout of pieces
     * on the board through the channel.
     * @param {string} senderId the sender the event came from.
     */
    onBoardLayoutRequest: function(senderId) {
      console.log('****onBoardLayoutRequest****');
      var boardLayout = [];
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          boardLayout[i * 3 + j] = this.mBoard.mBoard[i][j];
        }
      }
      this.castMessageBus_.send(senderId, {
        'event': 'board_layout_response',
        'board': boardLayout });
    },

    sendError: function(senderId, errorMessage) {
      this.castMessageBus_.send(senderId, {
        'event': 'error',
        'message': errorMessage });
    },

    broadcastEndGame: function(endState, winningLocation) {
      console.log('****endGame****');
      this.mPlayer1 = -1;
      this.mPlayer2 = -1;
      this.broadcast({
        event: 'endgame',
        end_state: endState,
        winning_location: winningLocation });
    },

    /**
     * @private
     */
    startGame_: function() {
      console.log('****startGame****');
      var firstPlayer = Math.floor((Math.random() * 10) % 2);
      this.mPlayer1.player = (firstPlayer === 0) ?
          TicTacToe.PLAYER.X : TicTacToe.PLAYER.O;
      this.mPlayer2.player = (firstPlayer === 0) ?
          TicTacToe.PLAYER.O : TicTacToe.PLAYER.X;
      this.mCurrentPlayer = TicTacToe.PLAYER.X;

      this.castMessageBus_.send(
          this.mPlayer1.senderId, {
            event: 'joined',
            player: this.mPlayer1.player,
            opponent: this.mPlayer2.name
          });
      this.castMessageBus_.send(
          this.mPlayer2.senderId, {
            event: 'joined',
            player: this.mPlayer2.player,
            opponent: this.mPlayer1.name
          });
    },

    /**
     * Broadcasts a message to all of this object's known channels.
     * @param {Object|string} message the message to broadcast.
     */
    broadcast: function(message) {
      this.castMessageBus_.broadcast(message);
    }

  };

  // Exposes public functions and APIs
  cast.TicTacToe = TicTacToe;
})();
