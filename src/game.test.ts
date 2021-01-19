import {GAME_STATES, GEM_COLORS} from './constants';
import {
  addPlayer,
  createGame,
  chooseGemToBuy,
  cancelGemPurchase,
  buyChosenGems,
  chooseCardToReserve,
  cancelCardReservation,
  reserveChosenCard,
  buyReservedCard,
  buyCard,
  buyOrReserveCard,
  returnPlayerGemToPool,
  processEndOfTurn,
} from './game';
import {
  CardLevel,
  Game,
} from './types';

const CardExpectObject = expect.objectContaining({
  color: expect.any(String),
  cost: expect.arrayContaining([expect.any(String)]),
  points: expect.any(Number),
  level: expect.any(Number),
});
const NobleExpectObject = expect.objectContaining({
  points: expect.any(Number),
  cost: expect.arrayContaining([expect.any(String)]),
});

describe('Game Setup', () => {
  test('creates a new game', () => {
    const game = createGame();

    expect(game).toMatchObject({
      players: [],
      gemPool: expect.arrayContaining([expect.any(String)]),
      cardPool: {
        deck: expect.arrayContaining([CardExpectObject]),
        cards: expect.arrayContaining([CardExpectObject]),
      },
      noblePool: expect.arrayContaining([NobleExpectObject]),
      currentPlayerIndex: -1,
      state: GAME_STATES.SETUP,
      tokensToBuy: [],
      cardToReserve: null,
    });
  });

  test('adds new player', () => {
    const game = createGame();

    const updatedGame = addPlayer(game);

    expect(updatedGame).toMatchObject({
      ...game,
      currentPlayerIndex: 0,
      players: [{
        id: 0,
        cards: [],
        nobles: [],
        reservedCards: [],
        gems: [],
      }],
    });
  });

  test('adds second player', () => {
    const game = createGame();

    const updatedGame = addPlayer(addPlayer(game));

    expect(updatedGame).toMatchObject({
      ...game,
      currentPlayerIndex: 0,
      players: [{
        id: 0,
        cards: [],
        nobles: [],
        reservedCards: [],
        gems: [],
      }, {
        id: 1,
        cards: [],
        nobles: [],
        reservedCards: [],
        gems: [],
      }],
    });
  });
});


describe('Player\'s Turn', () => {

  const readyGame = addPlayer(addPlayer(createGame()));
  const cardMock = {
    color: GEM_COLORS.RED,
    cost: [GEM_COLORS.RED, GEM_COLORS.BLUE, GEM_COLORS.BLACK],
    points: 0,
    level: CardLevel.one,
  };
  const cardWithPointsMock = {
    color: GEM_COLORS.RED,
    cost: [GEM_COLORS.RED, GEM_COLORS.BLUE, GEM_COLORS.BLACK],
    points: 5,
    level: CardLevel.one,
  };

  test('can choose a gem to buy', () => {
    const game = chooseGemToBuy(readyGame, GEM_COLORS.RED);

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED],
    });
  });

  test('can choose two gems to buy', () => {
    const game = chooseGemToBuy(
      chooseGemToBuy(readyGame, GEM_COLORS.RED),
      GEM_COLORS.BLUE,
    );

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED, GEM_COLORS.BLUE],
    });
  });

  test('can choose three gems to buy', () => {
    const game = chooseGemToBuy(
      chooseGemToBuy(
        chooseGemToBuy(readyGame, GEM_COLORS.RED),
        GEM_COLORS.BLUE
      ),
      GEM_COLORS.GREEN,
    );

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED, GEM_COLORS.BLUE, GEM_COLORS.GREEN],
    });
  });

  test('limit chosen gems for buying to three', () => {
    const game = chooseGemToBuy(
      chooseGemToBuy(
        chooseGemToBuy(
          chooseGemToBuy(readyGame, GEM_COLORS.RED),
          GEM_COLORS.BLUE
        ),
        GEM_COLORS.BLACK,
      ),
      GEM_COLORS.GREEN,
    );

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED, GEM_COLORS.BLUE, GEM_COLORS.BLACK],
    });
  });

  test('prevent choosing other colors, if two same colors chosen already', () => {
    const game = chooseGemToBuy(
      chooseGemToBuy(
        chooseGemToBuy(
          chooseGemToBuy(readyGame, GEM_COLORS.RED),
          GEM_COLORS.RED
        ),
        GEM_COLORS.BLACK,
      ),
      GEM_COLORS.GREEN,
    );

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED, GEM_COLORS.RED],
    });
  });

  test('prevent choosing multiple colors if less than 4', () => {
    const game = chooseGemToBuy(
      chooseGemToBuy(
        chooseGemToBuy(
          chooseGemToBuy({
            ...readyGame,
            gemPool: [
              GEM_COLORS.RED,
              GEM_COLORS.RED,
              GEM_COLORS.BLACK,
              GEM_COLORS.GREEN,
            ],
          }, GEM_COLORS.RED),
          GEM_COLORS.RED
        ),
        GEM_COLORS.BLACK,
      ),
      GEM_COLORS.GREEN,
    );

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED, GEM_COLORS.BLACK, GEM_COLORS.GREEN],
    });
  });

  test('can cancel gem purchase ', () => {
    const game = cancelGemPurchase(
      chooseGemToBuy(
        chooseGemToBuy(
          chooseGemToBuy(readyGame, GEM_COLORS.RED),
          GEM_COLORS.BLACK,
        ),
        GEM_COLORS.GREEN,
      ),
      GEM_COLORS.GREEN
    );

    expect(game).toMatchObject({
      ...game,
      tokensToBuy: [GEM_COLORS.RED, GEM_COLORS.BLACK],
    });
  });

  test('can buy chosen gems', () => {
    const game = buyChosenGems(chooseGemToBuy(
      chooseGemToBuy(
        chooseGemToBuy(
          {
            ...readyGame,
            gemPool: [
              GEM_COLORS.BLACK,
              GEM_COLORS.RED,
              GEM_COLORS.GREEN,
              GEM_COLORS.WHITE,
            ],
          },
          GEM_COLORS.RED,
        ),
        GEM_COLORS.BLACK,
      ),
      GEM_COLORS.GREEN
    ));

    expect(game.players[0].gems).toEqual([
      GEM_COLORS.RED, GEM_COLORS.BLACK, GEM_COLORS.GREEN,
    ]);
    expect(game.gemPool).toEqual([GEM_COLORS.WHITE]);
    expect(game.state).toBe(GAME_STATES.END_TURN);
  });

  test('can choose to reserve card', () => {
    const game = chooseCardToReserve(readyGame, cardMock);

    expect(game.cardToReserve).toEqual(cardMock);
  });

  test('can cancel reserve card choice', () => {
    const game = chooseCardToReserve(readyGame, cardMock);

    expect(game.cardToReserve).toEqual(cardMock);

    const updatedGame = cancelCardReservation(readyGame);
    expect(updatedGame.cardToReserve).toEqual(null);
  });

  test('can reserve chosen card', () => {
    const game = reserveChosenCard(chooseCardToReserve(readyGame, cardMock));

    expect(game.cardToReserve).toBe(null);
    expect(game.state).toBe(GAME_STATES.END_TURN);
    expect(game.players[0].reservedCards).toEqual([cardMock]);
  });

  test('can buy reserved card', () => {
    const setupGame: Game = {
      ...readyGame,
      gemPool: [GEM_COLORS.GREEN],
    };
    setupGame.players[0].gems = [...cardMock.cost, GEM_COLORS.RED];
    const game = [
      chooseCardToReserve,
      reserveChosenCard,
      buyReservedCard,
    ].reduce((game, func) => func(game, cardMock), setupGame);

    expect(game.cardToReserve).toBe(null);
    expect(game.state).toBe(GAME_STATES.END_TURN);
    expect(game.gemPool.sort()).toEqual([GEM_COLORS.GREEN, ...cardMock.cost].sort());
    expect(game.players[0].reservedCards).toEqual([]);
    expect(game.players[0].cards.includes(cardMock)).toBe(true);
    expect(game.players[0].gems).toEqual([GEM_COLORS.RED]);
  });

  test('can buy card', () => {
    const setupGame: Game = {
      ...readyGame,
      gemPool: [GEM_COLORS.GREEN],
    };
    setupGame.players[0].gems = [...cardMock.cost, GEM_COLORS.RED];
    const game = buyCard(setupGame, cardMock);

    expect(game.cardToReserve).toBe(null);
    expect(game.state).toBe(GAME_STATES.END_TURN);
    expect(game.gemPool.sort()).toEqual([GEM_COLORS.GREEN, ...cardMock.cost].sort());
    expect(game.players[0].reservedCards).toEqual([]);
    expect(game.players[0].cards.includes(cardMock)).toBe(true);
    expect(game.players[0].gems).toEqual([GEM_COLORS.RED]);
  });

  test('reserve card if cant afford', () => {
    const setupGame: Game = {
      ...readyGame,
      gemPool: [GEM_COLORS.GREEN],
    };
    setupGame.players[0].gems = [GEM_COLORS.RED];
    const game = buyOrReserveCard(setupGame, cardMock);

    expect(game.cardToReserve).toBe(cardMock);
    expect(game.gemPool).toEqual([GEM_COLORS.GREEN]);
    expect(game.players[0].reservedCards).toEqual([]);
    expect(game.players[0].gems).toEqual([GEM_COLORS.RED]);
  });

  test('cant reserve more than three cards', () => {
    const setupGame: Game = {
      ...readyGame,
      gemPool: [GEM_COLORS.GREEN],
    };
    setupGame.players[0] = {
      ...setupGame.players[0],
      gems: [...cardMock.cost, GEM_COLORS.RED],
      reservedCards: [cardMock, cardMock, cardMock],
    };
    const game = buyOrReserveCard(setupGame, cardMock);

    expect(game.cardToReserve).toBe(null);
    expect(game.gemPool.sort()).toEqual([GEM_COLORS.GREEN, ...cardMock.cost].sort());
    expect(game.players[0].reservedCards).toEqual([cardMock, cardMock, cardMock]);
    expect(game.players[0].gems).toEqual([GEM_COLORS.RED]);
  });

  test('can return gems to pool when player has over ten tokens', () => {
    const setupGame: Game = {
      ...readyGame,
      gemPool: [GEM_COLORS.GREEN],
    };
    setupGame.players[0] = {
      ...setupGame.players[0],
      gems: [
        GEM_COLORS.RED, GEM_COLORS.RED, GEM_COLORS.RED,
        GEM_COLORS.GREEN, GEM_COLORS.GREEN, GEM_COLORS.GREEN,
        GEM_COLORS.BLUE, GEM_COLORS.BLUE, GEM_COLORS.BLUE,
        GEM_COLORS.BLACK, GEM_COLORS.BLACK, GEM_COLORS.BLACK,
      ],
    };
    const game = returnPlayerGemToPool(setupGame, GEM_COLORS.BLUE);

    expect(game.players[0].gems.sort()).toEqual([
      GEM_COLORS.RED, GEM_COLORS.RED, GEM_COLORS.RED,
      GEM_COLORS.GREEN, GEM_COLORS.GREEN, GEM_COLORS.GREEN,
      GEM_COLORS.BLUE, GEM_COLORS.BLUE,
      GEM_COLORS.BLACK, GEM_COLORS.BLACK, GEM_COLORS.BLACK,
    ].sort());
    expect(game.gemPool).toEqual([GEM_COLORS.GREEN, GEM_COLORS.BLUE]);
  });

  test('end game when player wins', () => {
    const setupGame: Game = {
      ...readyGame,
      gemPool: [GEM_COLORS.GREEN],
      state: GAME_STATES.CHECK_WIN,
    };
    setupGame.players[0].cards = [
      cardWithPointsMock, cardWithPointsMock, cardWithPointsMock,
    ];

    const game = processEndOfTurn(setupGame);

    expect(game.state).toBe(GAME_STATES.GAME_END);
  });
});

