/**
 * Updates the SSCD sheet with new data; archives the old.
 */
function updateSscdSheet() {
  var sscd           = SpreadsheetApp.getActive();
  var sscd_sheet     = sscd.getSheetByName(sscd_sheet_name);
  var incoming_sheet = sscd.getSheetByName(incoming_sheet_name);
  var vars_sheet     = sscd.getSheetByName(vars_sheet_name);
  var dr_sheet       = sscd.getSheetByName(drsheet_name);
  
  if (checkForSscdBloat(sscd) == false) {return};

  if (checkForNewData() == false) {return};
  sscdSheetIsFirst(sscd, sscd_sheet);
  
  var curr_timestamp = isoDateString() + "_" + isoTimeString();
  var last_timestamp = vars_sheet.getRange(vars_sheet_last_timestamp).getValue();
  
  backupSheet(sscd_sheet, last_timestamp);
  importNewDataFromGdrive(incoming_sheet, sscd_data_file_name);

  var sscd_sos     = sscd_sheet.getRange(2, 1, sscd_sheet.getLastRow() - 1, 1).getValues();
  var incoming_sos = incoming_sheet.getRange(1, 1, incoming_sheet.getLastRow(), 1).getValues();
  updateAddOrRemoveRows(sscd_sheet, incoming_sheet, dr_sheet, sscd_sos, incoming_sos);
  
  setVarsSheetValues(vars_sheet, last_timestamp, curr_timestamp);
  renameSscdWithCurrentTimestamp(sscd, curr_timestamp);
  
  freeze1Row1Col(sscd_sheet, false);
  fancySort(sscd_sheet);
  
  setReferenceCells(sscd_sheet);
  
  hideEmptyRows(sscd_sheet);
  freeze1Row1Col(sscd_sheet, true);
  sscd_sheet.showSheet();
  sscd_sheet.activate();
}
