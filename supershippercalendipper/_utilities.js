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

// Popup message in lower right corner
function toaster(msg, title, time) {
  msg   = (msg   === undefined ? "" : msg);
  title = (title === undefined ? "" : title);
  time  = (time  === undefined ? 20 : time);
  SpreadsheetApp.getActiveSpreadsheet().toast(msg, title, time);
}

// Popup "Okay" dialog box with message
function say(msg) {
  msg   = (msg   === undefined ? "" : msg);
  var ui = SpreadsheetApp.getUi();
  ui.alert(msg);
}

// Convert a one or two digit column letter to its column number
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

function getWeekDay(date){
  date = (date === undefined ? new Date() : date);
  var dayNumber = date.getDay();
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[dayNumber];
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






// Testing stuff below here:

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


function sortSscdSheet() {
  var sscd = SpreadsheetApp.getActive();
  var sscd_sheet = sscd.getSheetByName(sscd_sheet_name)
  fancySort(sscd_sheet);
}

function somethingOrNothing(thing) { return ((thing != null) ? thing.valueOf() : "NOTHING") }

function testStuff() {  // test comment
//  Logger.log(getWeekDay());
  
  
  var sscd = SpreadsheetApp.getActive();
  var dr_sheet  = sscd.getSheetByName(drsheet_name);
  var cell      = dr_sheet.getRange("F223");
  Logger.log((cell.getValue().getMonth() + 1) + "/" + cell.getValue().getDate());
  
//  var ss = SpreadsheetApp.getActiveSpreadsheet();
//  var sheet = ss.getSheets()[0];
//  var range = sheet.getRange(1, 1, 3, 3);
//  var values = range.getValues();
//
//  // Print values from a 3x3 box.
//  for (var row in values) {
//    for (var col in values[row]) {
//      Logger.log(values[row][col]);
//    }
//  }

//  checkForSscdBloat(sscd);
  
//  var vars_sheet = sscd.getSheetByName("vars")
//  var last_timestamp = vars_sheet.getRange(vars_sheet_last_timestamp).getValue();

//  var sscd_name = sscd.getName();
//  sscd.rename(sscd_name.replace(/; .*/, "; ") + "3rd test");
//  var sscd_sheet = sscd.getSheetByName("current");
//  fancySort(sscd_sheet);
//  sscd_sheet.activate();
//  var test_sheet = sscd.getActiveSheet();
//  var sscd_sheet_name = test_sheet.getName();
//  Logger.log(last_timestamp);
  //var sheetname;
  //var sheet;
  //for (var i = 35; i < 39; i++) {
  //  sheetname = sscd_sheets[(i)].getSheetName();
  //  sheet = sscd.getSheets()[(i)]
  //  sscd.deleteSheet(sheet);
//    Logger.log("deleted " + i + " - " + sheetname);
//  }
  //toaster(fileExistsOnGDriveRoot("shipal.csv"))
  //Logger.log("Protected ranges:\n")
//  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("20161102");
//  var range_to_protect = ss.getRange(csr_notes_column + ":" + csr_notes_column);
//  var protection = range_to_protect.protect().setDescription("testing...");
//  protection.removeEditors(protection.getEditors());
//  protection.addEditors(csr_editors).addEditors(sscd_editors);
  /**var protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    var protection = protections[i];
    Logger.log(protection.getRange().getA1Notation());
    Logger.log(protection.getEditors());
    //if (protection.canEdit()) {
    //  protection.remove();
    //}
  }
  Logger.log("Sheet protection:\n")
  var sheet_protection = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
  var sheet_editors = sheet_protection.getEditors();
  Logger.log(sheet_editors);
  var unprotected = sheet_protection.getUnprotectedRanges();
  for (var i = 0; i < unprotected.length; i++) {
    var protection = unprotected[i];
    Logger.log(protection.getA1Notation());
    //if (protection.canEdit()) {
    //  protection.remove();
    //}
  }
  */
}
