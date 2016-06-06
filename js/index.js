// This is the Javascript for the FCC calculator
'use strict';

var down = false;
// Keyboard handler
$(document).keydown(function(event) {
  // Prevent repetitive key strokes
  if (down) return;
  down = true;
  event.preventDefault();
  $(".keyPressed").html(event.key);
  switch (event.key) {
    case "q":
    case "Q": // MC
      $("#MC").blink();
      break;
    case "w":
    case "W": // M+
      break;
    case "e":
    case "E": // M-
      break;
    case "r":
    case "R": // MR
      break;
    case "Delete":
    case "Backspace": // CE
      break;
    case "Escape": // C
      break;
    case "%": // %
      break;
    case "n":
    case "N": // +/-
      break;
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9": // Digits
      break;
    case "/":
    case "*":
    case "-":
    case "+": // Operators
      break;
    case ".": // .
      break;
    case "Enter":
    case "=": // Equal
      break;
    default:
    // Do nothing!
  }
});

$(document).keyup(function() {
  down = false;
})

// Blinks the key when pressed
$.fn.blink = function() {
  this.addClass("active")
      .delay(100)
      .queue(function() {
        $(this).removeClass("active").dequeue();
      });
};
