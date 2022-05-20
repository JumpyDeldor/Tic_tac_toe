var socket = io();
var symbol;
$(function () {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);
  // Вызов метода во время хода
  socket.on("move.made", function (data) {
    // Рендер хода
    $("#" + data.position).text(data.symbol);
    // Смотрим на символ игрока, чтобы определить кто ходит

    myTurn = data.symbol !== symbol;

    // Отображение текста
    if (!isGameOver()) {
      if (gameTied()) {
        $("#messages").text("Game Drawn!");
        $(".board button").attr("disabled", true);
      } else {
        renderTurnMessage();
      }
      // Конец игры
    } else {
      if (myTurn) {
        $("#messages").text("Game over. You lost.");
      } else {
        $("#messages").text("Game over. You won!");
      }
      $(".board button").attr("disabled", true);
    }
  });

  // Стартовое пле
  socket.on("game.begin", function (data) {
    // Выдача игрокам Х и О
    symbol = data.symbol;
    // У Х первый ход
    myTurn = symbol === "X";
    renderTurnMessage();
  });

  // Отключение доски, если противник ушёл
  socket.on("opponent.left", function () {
    $("#messages").text("Your opponent left the game.");
    $(".board button").attr("disabled", true);
  });
});

function getBoardState() {
  var obj = {};
  // Выставляем Х и О, которые есть на доске
  $(".board button").each(function () {
    obj[$(this).attr("id")] = $(this).text() || "";
  });
  return obj;
}

function gameTied() {
  var state = getBoardState();

  if (
    state.a0 !== "" &&
    state.a1 !== "" &&
    state.a2 !== "" &&
    state.b0 !== "" &&
    state.b1 !== "" &&
    state.b2 !== "" &&
    state.b3 !== "" &&
    state.c0 !== "" &&
    state.c1 !== "" &&
    state.c2 !== ""
  ) {
    return true;
  }
}

function isGameOver() {
  var state = getBoardState(),
    // Проверяем на конец игры
    matches = ["XXX", "OOO"],
    // Всевозможные комбинации
    rows = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2,
    ];

  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  // Блокировка доски, во время хода противника
  if (!myTurn) {
    $("#messages").text("Your opponent's turn");
    $(".board button").attr("disabled", true);
    // Включение доски в свой ход
  } else {
    $("#messages").text("Your turn.");
    $(".board button").removeAttr("disabled");
  }
}

function makeMove(e) {
  e.preventDefault();
  if (!myTurn) {
    return;
  }
  if ($(this).text().length) {
    return;
  }

  // Передача хода
  socket.emit("make.move", {
    symbol: symbol,
    position: $(this).attr("id"),
  });
}
