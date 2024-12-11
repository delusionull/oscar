function getNote(cell) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Issues")
    var range = sheet.getRange(cell);
    return range.getNote();      
}
