// This is the Javascript for the FCC calculator
'use strict';

var previousKey = "", // Prevent keyboard repeat
    keyIdTable = {"q": "MC", "Q": "MC",
                  "w": "Mplus", "W": "Mplus",
                  "e": "Mminus", "E": "Mminus",
                  "r": "MR", "R": "MR",
                  "Delete": "CE", "Backspace": "CE",
                  "Escape": "CA",
                  "%": "percent",
                  "n": "plusmn", "N": "plusmn",
                  "0": "d0", "1": "d1", "2": "d2", "3": "d3", "4": "d4",
                  "5": "d5", "6": "d6", "7": "d7", "8": "d8", "9": "d9",
                  "/": "div", "*": "mul", "-": "min", "+": "plu",
                  ".": "dot",
                  "=": "equal", "Enter": "equal"},
    $screenText = $(".screen-text"),
    operator = "",
    firstOperand = "",
    lastPressed = "";


// Keyboard handler
$(document).keydown(function(event) {
  if (event.key != "F5"){ //DEBUG
    event.preventDefault();
  }
  // Prevent repetitive key strokes
  if (previousKey == event.key){
    return;
  }
  previousKey = event.key;

  // Blinking of the appropriate key & Process
  $keyToId(event.key)
    .blink()
    .processInput();
});

$(document).keyup(function() {
  previousKey = ""; // Allows multiple keys pressed at the same time
})

$(".calculator").click(function(event) {
  $(event.target).processInput();
})

$(document).ready(function() {
  addToolTips();
})

// Blinks the key when pressed
$.fn.blink = function() {
  this.addClass("active")
      .delay(100)
      .queue(function() {
        $(this).removeClass("active").dequeue();
      });
  return this;
};

// Main input handler
$.fn.processInput = function() {
  // Parse decimal dot
  if (this.hasClass('dot')) {
    parseDot();
    return;
  }
  // Parse sign change
  if (this.hasClass('plusmn')) {
    parsePlusmn();
    return;
  }
  var buttonId = this.attr("id");
  // Parse CE and C
  if (this.hasClass('clear')) {
    parseClear(buttonId);
    return;
  }
  // Parse digits
  if (this.hasClass('digit')) {
    parseDigit(buttonId);
    return;
  }
  if (this.hasClass('operator')) {
    parseOperator(buttonId);
    return;
  }
}

////////////Parsing functions///////////////////
var parseClear = function(id) {
  $screenText.text("0");
  if (id == "CE") {
    lastPressed = operator; // Allows for double operator action
  } else {
    operator = "";
    firstOperand = "";
    lastPressed = "";
  }
}

var parseCA = function() {
  $screenText.text("0");
  operator = "";
  firstOperand = "";
  lastPressed = "";
}

var parseDot = function() {
  if ($screenText.text().indexOf('.') == -1) {
    $screenText.append('.');
  }
  lastPressed = ".";
}

var parseDigit = function(id) {
  // Handle the original zero
  if ($screenText.text() == "0") {
    $screenText.text(id.slice(-1));
  } else if ($screenText.text().match(/[0-9]/g).length < 8) {
    // If less than 8 digits, display the digits
    $screenText.append(id.slice(-1));
  }
  lastPressed = "digit";
}

var parsePlusmn = function() {
  var screenText = $screenText.text();
  if (screenText != "0") {
    if (screenText.slice(0, 1) == "-") {
      $screenText.text(screenText.slice(1));
    } else {
      $screenText.text("-" + screenText);
    }
  }
  // No need to update lastPressed
}

var parseOperator = function(id) {
  if (operator == id) {
    // Double operator action
    operator = "2" + operator;
  } else {
    // TODO: Progress operation - Could be that operation has to be executed
  }

  clearTrailingZeroes();
  lastPressed = "operator";
}
//////////End of parsing functions

var clearTrailingZeroes = function() {
  if ($screenText.text().indexOf('.') != -1) {
    var screenText = $screenText.text();
    while(screenText.slice(-1) == "0") {
      screenText = screenText.slice(0, -1);
    }
    $screenText.text(screenText);
  }
}

// Returns the ID of the element called by the keyboard shortcut
var $keyToId = function(key) {
  return $('#' + keyIdTable[key]);
}

// Adds the keyboard tooltips
var addToolTips = function() {
  var idKeyTable = createTooltips(keyIdTable);
  for (var id in idKeyTable) {
    $("#" + id).append("<span class='tooltip'>" + idKeyTable[id] + "</span>");
  }
}

// Reverts key/value relationships. Handles multiple values and lower case single keys
var createTooltips = function(object) {
  var out = {};
  var v;
  for(var k in object) {
    v = object[k];
    if (v.length == 1) { // Keeps "Escape", etc. upper case
      v = v.toLowerCase();
    }
    if (out[v] === undefined) {
      out[v] = k.slice(0, 3);
    }
  }
  return out;
}
