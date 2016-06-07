// This is the Javascript for the FCC calculator
'use strict';

var previousKey = "", // Prevent keyboard repeat
    keyIdTable = {"q": "MC", "Q": "MC",
                  "w": "Mplus", "W": "Mplus",
                  "e": "Mminus", "E": "Mminus",
                  "r": "MR", "R": "MR",
                  "Delete": "CE", "Backspace": "CE",
                  "Escape": "C",
                  "%": "percent",
                  "n": "plusmn", "N": "plusmn",
                  "0": "d0", "1": "d1", "2": "d2", "3": "d3", "4": "d4",
                  "5": "d5", "6": "d6", "7": "d7", "8": "d8", "9": "d9",
                  "/": "div", "*": "mul", "-": "min", "+": "plu",
                  ".": "dot",
                  "=": "equal", "Enter": "equal"};


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

  // Blinking of the appropriate key
  $keyToId(event.key).blink();
});

$(document).keyup(function() {
  previousKey = "";
})

// Blinks the key when pressed
$.fn.blink = function() {
  this.addClass("active")
      .delay(100)
      .queue(function() {
        $(this).removeClass("active").dequeue();
      });
};

// Returns the ID of the element called by the keyboard shortcut
var $keyToId = function(key) {
  return $('#' + keyIdTable[key]);
}
