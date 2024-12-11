/**
 * Updates OSCAR sheet with new data; archives the old.
 */
function updateOscarSheet() {
  var oscar          = SpreadsheetApp.getActive();
  var oscar_sheet    = oscar.getSheetByName(oscar_sheet_name);
  var incoming_sheet = oscar.getSheetByName(incoming_sheet_name);
  var forecast_sheet = oscar.getSheetByName(forecast_sheet_name);
  var vars_sheet     = oscar.getSheetByName(vars_sheet_name);
  var dr_sheet       = oscar.getSheetByName(drsheet_name);
  
  if (checkForOscarBloat(oscar) == false) {return};
  
  if (checkForNewData() == false) {return};
  oscarSheetIsFirst(oscar, oscar_sheet);
  
  var friendly_curr_timestamp = isoDateString(undefined ,1) + "_" + isoTimeString(undefined ,1);
  var curr_timestamp = isoDateString() + "_" + isoTimeString();
  var last_timestamp = vars_sheet.getRange(vars_sheet_last_timestamp).getValue();
  
  backupSheet(oscar_sheet, last_timestamp);
  importNewDataFromGdrive(incoming_sheet, oscar_data_file_name);
  importNewDataFromGdrive(forecast_sheet, oscar_forecast_file_name);
  
  var oscar_sos = oscar_sheet.getRange(2, toNum(sales_order_col), oscar_sheet.getLastRow() - 1, 1).getValues();
  var incoming_sos = incoming_sheet.getRange(1, 1, incoming_sheet.getLastRow(), 1).getValues();
  updateAddOrRemoveRows(oscar_sheet, incoming_sheet, dr_sheet, oscar_sos, incoming_sos);
  
  setVarsSheetValues(vars_sheet, last_timestamp, curr_timestamp);
  renameOscarWithCurrentTimestamp(oscar, friendly_curr_timestamp);
  
  freeze1Row1Col(oscar_sheet, false);
  fancySort(oscar_sheet);
  
  setReferenceCells(oscar_sheet);
  
  hideEmptyRows(oscar_sheet);
  freeze1Row1Col(oscar_sheet, true);
  oscar_sheet.showSheet();
  oscar_sheet.activate();
}
