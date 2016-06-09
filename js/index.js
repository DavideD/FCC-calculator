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
    lastPressed = "",
    isOverflow = false;


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
  var buttonId = this.attr("id");
  // Parse CE and C
  if (this.hasClass('clear')) {
    parseClear(buttonId);
    return;
  }
  if (!isOverflow) {
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
}

////////////Parsing functions///////////////////
var parseClear = function(id) {
  $screenText.text("0");
  if (id == "CA" || isOverflow) {
    operator = "";
    firstOperand = "";
    lastPressed = "";
  }
  isOverflow = false;
}

var parseCA = function() {
  $screenText.text("0");
  operator = "";
  firstOperand = "";
  lastPressed = "";
}

var parseDot = function() {
  if (lastPressed == "operator") {
    parseClear("CE");
  }
  if ($screenText.text().indexOf('.') == -1) {
    $screenText.append('.');
  }
  lastPressed = ".";
}

var parseDigit = function(id) {
  if (lastPressed == "operator") {
    parseClear("CE");
  }
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
  if (lastPressed == "operator") {
    parseClear("CE");
  }
  clearTrailingZeroes();
  var screenText = $screenText.text();
  if (parseFloat(screenText) !== 0) {
    if (screenText.slice(0, 1) == "-") {
      $screenText.text(screenText.slice(1));
    } else {
      $screenText.text("-" + screenText);
    }
  }
  // No need to update lastPressed
}

var parseOperator = function(id) {
  clearTrailingZeroes();
  if (lastPressed == "operator") {
    // Operator stored

  } else {
    if (firstOperand == "") {
      //  First operation - No operand
      firstOperand = $screenText.text();
    } else {
      // More than one operation - Calculate
      $screenText.text(calculate());
      clearTrailingZeroes();
      firstOperand = $screenText.text();
    }
    operator = id;
  }
  lastPressed = "operator";
}
//////////End of parsing functions

// Process operands and operator
var calculate = function() {
  var secondOperand = $screenText.text();
  var opFn;
  switch (operator) {
    case "plu":
    opFn = function (lhs, rhs) {return lhs + rhs};
    break;
    case "min":
    opFn = function (lhs, rhs) {return lhs - rhs};
    break;
    case "mul":
    opFn = function (lhs, rhs) {return lhs * rhs};
    break;
    case "div":
    opFn = function (lhs, rhs) {return lhs / rhs}
    break;
  }
  var result = opFn(parseFloat(firstOperand), parseFloat(secondOperand));
  checkForOverflow(result);
  return resultToText(result);
}

// Convert result to text and deals with overflow
var resultToText = function(value) {
  var text = "";
  if (isOverflow) {
    // Handle NaN
    if (isNaN(value)) {
      text = "E";
    } else if (isFinite(value)) {
      // Finite but too big
      text = parseFloat(Math.abs(value));
      text = text.slice(0, 1) + "." + text.slice(1, 7) + "E";
    } else {
      // Infinity
      text = "9.999999E";
    }
    if (value < 0) {
      text = "-" + text;
    }
  } else {
    // OK value - Trim extra digits
    var nDecimals = 7 - Math.floor(Math.log10(Math.abs(value)));
    text = "" + Math.round(value * Math.pow(10, nDecimals));
    // Add the dot
    text = text.slice(0, -nDecimals) + "." + text.slice(-nDecimals);
  }
  return text;
}

var clearTrailingZeroes = function() {
  if ($screenText.text().indexOf('.') != -1) {
    var screenText = $screenText.text();
    while (screenText.slice(-1) == "0") {
      screenText = screenText.slice(0, -1);
    }
    if (screenText.slice(-1) == ".") {
      screenText = screenText.slice(0, -1);
    }
    $screenText.text(screenText);
  }
}

var checkForOverflow = function(value) {
  isOverflow = (value > 99999999 || value < -99999999 || isNaN(value));
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
