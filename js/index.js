// This is the Javascript for the FCC calculator
'use strict';

var previousKey = "", // Prevent keyboard repeat
    keyIdTable = {"q": "MC", "Q": "MC",
                  "w": "Mplu", "W": "Mplu",
                  "e": "Mmin", "E": "Mmin",
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
    displaySize = 8,
    $screenText = $(".screen-text"),
    operator = "",
    firstOperand = "",
    lastPressed = "", // Values can be "digit", "operator", "result"
    isOverflow = false,
    memory = 0;

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
    if (this.hasClass('equal')) {
      parseEqual();
      return;
    }
    if (this.hasClass('memory')) {
      parseMemory(buttonId);
      return;
    }
    if (this.hasClass('percent')) {
      parsePercent();
      return;
    }
  }
}

////////////Parsing functions///////////////////
var parseClear = function(id) {
  $screenText.text("0");
  if (id == "CA") {
    operator = "";
    firstOperand = "";
    lastPressed = "";
  }
  isOverflow = false;
}

var parseDot = function() {
  if (lastPressed == "operator") {
    parseClear("CE");
  }
  if ($screenText.text().indexOf('.') == -1) {
    $screenText.append('.');
  }
  lastPressed = "digit";
}

var parseDigit = function(id) {
  if (lastPressed == "operator" || lastPressed == "result") {
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
  var screenText = clearTrailingZeroes($screenText.text());
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
  $screenText.text(clearTrailingZeroes($screenText.text()));
  if (lastPressed == "operator") {
    // Possible repeat operation
    if (operator.slice(-3) == id) { // In case it's already the repeat
      operator = "2" + id;
      firstOperand = $screenText.text();
      $screenText.text(calculate());
      lastPressed = "result";
    } else {
      // We've just changed the operator
      operator = id;
      lastPressed = "operator";
    }
  } else {
    if (firstOperand == "" || operator[0] == "2") {
      //  First operation or clear repeat operation
      firstOperand = $screenText.text();
    } else {
      // More than one operation - Calculate
      $screenText.text(calculate());
      firstOperand = $screenText.text();
    }
    operator = id;
    lastPressed = "operator";
  }
}

var parseEqual = function() {
  switch (lastPressed) {
    case "digit":
    case ".":
      if (operator == "") {
        $screenText.text(clearTrailingZeroes($screenText.text()));
      } else {
        $screenText.text(calculate());
      }
      break;
    case "result":
      if (operator[0] == "2"){
        // Repeat operation
        $screenText.text(calculate());
      }
    default:
      $screenText.text(clearTrailingZeroes($screenText.text()));
  }
  if (operator[0] != 2) {
    // Only forget if it's not a double operator
    operator = "";
    firstOperand = "";
  }
  lastPressed = "result";
}

var parseMemory = function(id) {
  switch (id) {
    case "MC":
      memory = 0;
      break;
    case "Mplu":
    case "Mmin":
      var newVal = operatorFn(id.slice(-3))(memory,
                                            parseFloat($screenText.text()));
      checkForOverflow(newVal);
      if (isOverflow) {
        displayError();
      } else {
        memory = newVal;
      }
      break;
    case "MR":
      parseClear("CA");
      $screenText.text(resultToText(memory));
      break;
  }
  lastPressed = "result";
}

var parsePercent = function() {
  var value = parseFloat($screenText.text());
  if (firstOperand == "") {
    value = value * 0.01;
  } else {
    value = value * 0.01 * parseFloat(firstOperand);
  }
  $screenText.text(resultToText(value));
  lastPressed = "digit";
}
//////////End of parsing functions

// Process operands and operator
var calculate = function() {
  var secondOperand = $screenText.text();
  var result = operatorFn(operator.slice(-3))(parseFloat(firstOperand),
                                              parseFloat(secondOperand));
  checkForOverflow(result);
  return resultToText(result);
}

var operatorFn = function(operator) {
  switch (operator) { // Takes into account double operator
    case "plu":
      return function (lhs, rhs) {return lhs + rhs};
      break;
    case "min":
      return function (lhs, rhs) {return lhs - rhs};
      break;
    case "mul":
      return function (lhs, rhs) {return lhs * rhs};
      break;
    case "div":
      return function (lhs, rhs) {return lhs / rhs}
      break;
    default:
      return;
  }
}

// Display an E at the end of the display
var displayError = function() {
  var text = $screenText.text();
  $screenText.text(text.slice(0, -1) + "E");
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
      text = "" + Math.abs(value);
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
    var nDecimals = Math.min(displaySize - Math.log10(Math.abs(value)), 7);
    text = value.toFixed(nDecimals);
  }
  return clearTrailingZeroes(text);
}

var clearTrailingZeroes = function(text) {
  if (text.indexOf('.') != -1) {
    while (text.slice(-1) == "0") {
      text = text.slice(0, -1);
    }
    if (text.slice(-1) == ".") {
      text = text.slice(0, -1);
    }
  }
  return text;
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
