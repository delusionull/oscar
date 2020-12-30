// OSCAR Operational Shipping Calendar Ancillary Report

function onEdit(e){
  var email = Session.getActiveUser().getEmail();
  if (isIssuesSheetEdit(e)) { issuesSheetHandler(e) };
  if ( isNonMainSheetEdit(e) || isMultiCellEdit(e) || isNonEdit(e) || override() ) { return };
  if (undoProhibitedEdit(e)) { return };
  setCellEditNote(e);
  if (isOpsColumn(e)) { issueHandler(e) };
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('OSCAR Tools')
  .addSubMenu(ui.createMenu('Scheduler')
    .addItem('Update OSCAR Sheet...',    'updateOscarSheet')
    .addItem('Backup OSCAR...', 'backupOscar')
    .addItem('Sort OSCAR...', 'sortOscarSheet')
    .addItem('Reset Formatting...', 'resetOscarFormatting')
    .addItem('Delete Highlighted Issue...', 'manuallyDeleteIssue'))
  .addToUi();
}

function triggerEveryTwoHours() {
  updateShippingSheets();
  var oscar = SpreadsheetApp.getActive();
  var vars_sheet = oscar.getSheetByName(vars_sheet_name)
  vars_sheet.getRange(vars_sheet_today_date).setValue(isoDateString(_, 1));
}

function triggerEveryHour() {
  // check for new data and refresh oscar current sheet
}

function triggerEveryDayAt2Am() {
  var oscar = SpreadsheetApp.getActive();
  var oscar_sheet = oscar.getSheetByName(oscar_sheet_name)
  var issues_sheet = oscar.getSheetByName(issues_sheet_name)
  normalizeFontOfRange(oscar_sheet, oscar_edit_range);
  normalizeFontOfRange(issues_sheet, isu_reply_col + ":" + isu_reply_col);
}
