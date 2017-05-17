function onEdit(e){
  if ( isNonMainSheetEdit(e) || isMultiCellEdit(e) || isNonEdit(e) || override() ) { return }
  if (undoProhibitedEdit(e)) { return }
  setCellEditNote(e)
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SSCD Tools')
  .addSubMenu(ui.createMenu('CSR')
              .addItem('Generate CSR Action Sheet...', 'generateCSRActionSheet'))
  .addSeparator()
  .addSubMenu(ui.createMenu('Scheduler')
              .addItem('Update SSCD Sheet...',    'updateSSCDSheet'))
  .addToUi();
}

function triggerEveryTwoHours() {
  updateComponentsSheet();
  updateShippingSheets();
  
  var sscd = SpreadsheetApp.getActive();
  var vars_sheet = sscd.getSheetByName(vars_sheet_name)
  vars_sheet.getRange(vars_sheet_today_date).setValue(isoDateString(_, 1));
}

function triggerEveryHour() {
  // check for new data and refresh SSCD current sheet
}

function triggerEveryDayAt2AM() {
  var sscd = SpreadsheetApp.getActive();
  var sscd_sheet = sscd.getSheetByName(sscd_sheet_name)
  normalizeFontOfRange(sscd_sheet, sscd_edit_range);
}

