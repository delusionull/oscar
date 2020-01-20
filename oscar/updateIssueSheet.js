function updateIssuesSheet() {
  var oscar        = SpreadsheetApp.getActive();
  var oscar_sheet  = oscar.getSheetByName(oscar_sheet_name);
  var issues_sheet = oscar.getSheetByName(issues_sheet_name);
  var vars_sheet   = oscar.getSheetByName(vars_sheet_name);

  var curr_timestamp = isoDateString() + "_" + isoTimeString();
  
  backupSheet(oscar_sheet, last_timestamp);
  importNewDataFromGdrive(incoming_sheet, oscar_data_file_name);

  var oscar_sos     = oscar_sheet.getRange(2, 1, oscar_sheet.getLastRow() - 1, 1).getValues();
  var incoming_sos = incoming_sheet.getRange(1, 1, incoming_sheet.getLastRow(), 1).getValues();
  updateAddOrRemoveRows(oscar_sheet, incoming_sheet, dr_sheet, oscar_sos, incoming_sos);
  
  freeze1Row1Col(oscar_sheet, false);
  fancySort(oscar_sheet);
  
}
