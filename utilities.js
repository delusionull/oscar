var _; // convenient undefined param

// Pass a Date object; returns a String of the date (today, if no Date is passed),
// in ISO 8601 basic format, e.g. "20160512" or in ISO 8601 extended format,
// e.g "2016-05-12" if the 2nd parameter is set to 1
function isoDateString(date, extended) {
  date = (date === undefined ? new Date() : date);
  var dash  = (extended === 1 ? "-" : "");
  var yr    = date.getFullYear();
  var dd    = ("0" + date.getDate()).slice(-2);
  var mm    = ("0" + (date.getMonth()+1)).slice(-2);

  return yr.toString() + dash +
         mm.toString() + dash +
         dd.toString();
}

// Pass a Date object; returns a String of the time (now, if no Date is passed),
// in ISO 8601 basic format, e.g. "143256" or in ISO 8601 extended format,
// e.g "14:32:56" if the 2nd parameter is set to 1
function isoTimeString(date, extended) {
  date = (date === undefined ? new Date() : date);
  var colon = (extended === 1 ? ":" : "");
  var hh    = ("0" + date.getHours()).slice(-2);
  var mm    = ("0" + date.getMinutes()).slice(-2);
  var ss    = ("0" + date.getSeconds()).slice(-2);

  return hh.toString() + colon +
         mm.toString() + colon +
         ss.toString();
}

// Pass a Date object, and number of business days to increment
// it by; returns a Date, incremented as specified.
function incrementBusinessDateBy(start_date, increment_by) {
  var date_to_increment = start_date;
  var end_date = "", count = 0;
  while(count < Math.abs(increment_by)){
    end_date = new Date(date_to_increment.setDate(date_to_increment.getDate() + (increment_by > 0 ? 1 : -1)));
    if(end_date.getDay() != 0 && end_date.getDay() != 6){
      count++;
    }
  }
  return end_date;
}

// Check for the existence of a file on the root of the user's Google Drive
function fileExistsOnGDriveRoot(file_name) { return (DriveApp.getRootFolder().getFilesByName(file_name).hasNext() ? true : false) }

// Popup message
function toaster(msg, title, time) {
  msg   = (msg   === undefined ? "" : msg);
  title = (title === undefined ? "" : title);
  time  = (time  === undefined ? 20 : time);
  SpreadsheetApp.getActiveSpreadsheet().toast(msg, title, time);
}

// Convert a one or two digit letter to its number
function toNum(letter) {
  var left_digit_val = 0;
  if(letter.length == 2) {
    left_digit_val = ((letter[0].toLowerCase()).charCodeAt(0) - 96) * 26;
  }
  return (letter.slice(-1).toLowerCase()).charCodeAt(0) - 96 + left_digit_val;
}

function rangeOf(sheet, col1, col2) { return sheet.getRange(col1 + ":" + (col2 ? col2 : col1)) }

function hideEmptyRows(sheet) { sheet.hideRows(sheet.getLastRow() + 1, sheet.getMaxRows() - sheet.getLastRow()) }

function unHideAllRows(sheet) {
  var all_rows = sheet.getRange("A1:A");
  sheet.unhideRow(all_rows);
}

function freeze1Row1Col(sheet, status) {
  status = (status == (1 | true ) ? 1 : 0);
  sheet.setFrozenRows(status);
  sheet.setFrozenColumns(status);
}

function normalizeFontOfRange(sheet, range) {
  var ss_range = sheet.getRange(range);
  ss_range.setFontWeight("normal").setFontStyle("normal")
}

// Pass a sheet, column, and search string;
// Returns row of first matching cell.
function findInColumn(sheet, col, data) {
  var column = sheet.getRange(col + ":" + col);  // like A:A
  var values = column.getValues();
  var row = 0;
  while ( values[row] && values[row][0] !== data ) { row++ }
  if (values[row][0] === data) { return row+1 } else { return -1 }
}


// Do something with every row based on the value of the first column.
//function forEveryValueInColumn(ss, col) {
function forEveryValueInColumn() {
  Logger.log("start");
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sscd_sheet_name);
  var col = "H";

  var values = ss.getRange(col + "2:" + "Q" + ss.getLastRow()).getValues();
  var rows_in_col = values.length;
  var row = 0;
  var thedate;
  while (row < rows_in_col) {
    thedate = ((values[row][0].valueOf() == "") ? values[row][9].valueOf() : "").replace(/\d;.{7};(\d{4})-(\d\d)-(\d\d)/g, '$1$2$3').split(" ");
    if (thedate[0].length === 8) {
      var curr_wfm_date = latestDate(thedate);
//      Logger.log((row + 2) + " " + curr_wfm_date);
      var cell = ss.getRange("H" + (row + 2));
      Logger.log(cell.getA1Notation());
      cell.setValue(curr_wfm_date);
    }
    row++;
  }
  Logger.log("finish");
}

function latestDate(datearray) {
  var latest = datearray[0];

  for (var i = 0; i < datearray.length; i++) {
    if (latest < datearray[i] ) {
      latest = datearray[i];
    }
  }
  return latest.replace(/\d{4}(\d{2})(\d{2})/g, 'wfmm $1/$2').replace(/\b0/g, '');
}

function somethingOrNothing(thing) { return ((thing != null) ? thing.valueOf() : "NOTHING") }

