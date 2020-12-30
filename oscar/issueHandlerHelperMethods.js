function isNotIssue(edit) { return ( (edit.range.getDisplayValue().indexOf("ISSUE!")>-1 || (edit.oldValue ? edit.oldValue.indexOf("ISSUE!")>-1 : false)) ? false : true )}

function issueExists(oscar_so, isu_relevant_cells) { return RegExp(oscar_so).test(isu_relevant_cells) }

function issueTextChanged(osc_issue, isu_issue) { return ( (osc_issue == isu_issue) ? false : true ) }

function findIssueSheetIssueText(issue_so, isu_relevant_cells) {
  var issues_sheet_index = ArrayLib.indexOf(isu_relevant_cells, 0, issue_so);
  return isu_relevant_cells[issues_sheet_index][toNum(isu_issue_col)-1];
}

function findOscarSheetIssueText(issue_so, osc_relevant_cells) {
  var oscar_index = ArrayLib.indexOf(osc_relevant_cells, 0, issue_so);
  return osc_relevant_cells[oscar_index][toNum(ops_col)-1];
}

function updateIssueText(issue_so, customer, osc_issue, isu_note, ship_date, isu_relevant_cells, issues_sheet) {
  var index = ArrayLib.indexOf(isu_relevant_cells, 0, issue_so);
  issues_sheet.getRange(index+2, toNum(isu_ship_date_col)).setValue(ship_date);
  issues_sheet.getRange(index+2, toNum(isu_customer_col)).setValue(customer);
  issues_sheet.getRange(index+2, toNum(isu_sales_order_col), 1, 4).setBackground("white")
                                                                  .setFontColor("black");
  issues_sheet.getRange(index+2, toNum(isu_reply_col)).setBackground("white");
  issues_sheet.getRange(index+2, toNum(isu_issue_col)).setValue(osc_issue)
                                                      .setBackground("#FF6969")
                                                      .setFontWeight("bold")
                                                      .setNote(isu_note);
  issues_sheet.getRange(index+2, toNum(isu_resolved_col)).uncheck();
}

function addIssue(issue_so, customer, osc_issue, isu_note, ship_date, issues_sheet) {
  var emptyrow = issues_sheet.getLastRow()+1;
  issues_sheet.getRange(emptyrow, toNum(isu_sales_order_col)).setValue(issue_so);
  issues_sheet.getRange(emptyrow, toNum(isu_customer_col)).setValue(customer);
  issues_sheet.getRange(emptyrow, toNum(isu_ship_date_col)).setValue(ship_date);
  issues_sheet.getRange(emptyrow, toNum(isu_issue_col)).setValue(osc_issue)
                                                       .setBackground("#FF6969")
                                                       .setFontWeight("bold")
                                                       .setNote(isu_note);
  issues_sheet.getRange(emptyrow, toNum(isu_resolved_col)).insertCheckboxes();
}

function sortIssuesSheet(issues_sheet) {
  var is_range = issues_sheet.getRange("A2:" + isu_sheet_last_col);
  is_range.sort([{column: toNum(isu_ship_date_col),    ascending: true},
                 {column: toNum(isu_customer_col),     ascending: true},
                 {column: toNum(isu_sales_order_col),  ascending: true}]);
}

function logAndRemoveIssue(edit, isu_relevant_cells, issues_sheet) {
  var issues_log_sheet = SpreadsheetApp.getActive().getSheetByName(issues_log_sheet_name);
  var emptyrow = issues_log_sheet.getLastRow()+1;
  var issue_so = edit.range.getSheet().getRange(edit.range.getRow(), toNum(sales_order_col)).getValue();
  var index = ArrayLib.indexOf(isu_relevant_cells, 0, issue_so);
  var isu_sht_row = index+2;
  if ( isu_sht_row == 1 ) { return };
  issues_sheet.getRange(isu_sht_row, 1, 1, toNum(isu_sheet_last_col)).copyTo(issues_log_sheet.getRange(emptyrow, 1));
  issues_log_sheet.getRange(emptyrow, toNum(isu_log_resolved_time_col)).setValue( isoDateString(_, 1) + " " + isoTimeString(_, 1) );
  issues_sheet.getRange(isu_sht_row, 1, 1, toNum(isu_sheet_last_col)).clearContent()
                                                                     .clearNote()
                                                                     .clear({commentsOnly: true})
                                                                     .setBackground("white")
                                                                     .setFontColor("black");
  issues_sheet.getRange(isu_sht_row, 1, 1, toNum(isu_resolved_col)).removeCheckboxes();
  if ( allIssuesHaveBeenAnswered(issues_sheet) ) { highlightOpsHeader("white") };
}

function issuesSheetHandler(edit) {
  var oscar        = SpreadsheetApp.getActive();
  var issues_sheet = oscar.getSheetByName(issues_sheet_name);
  var oscar_sheet  = oscar.getSheetByName(oscar_sheet_name);
  
  if ( edit.range.getColumn() == toNum(isu_resolved_col) ) {
    if ( edit.range.isChecked() ) {
      setFormatIssueResolved(issues_sheet, edit);
    } else {
      setFormatIssueUnResolved(issues_sheet, edit)
    }
    if ( allIssuesHaveBeenAnswered(issues_sheet) ) { highlightOpsHeader("white") } else { highlightOpsHeader("red") } ;
    return;
  }
  
  if ( prohibited_issues_sheet_edit(edit) ) {
    if (override()) { return } else { undoEdit(edit) };
  } else {
    if ( edit.range.getValue() != "" ) {
      var ui = SpreadsheetApp.getUi();
      var result = ui.alert(
        'Please confirm',
        'Did your answer completely resolve this issue?',
        ui.ButtonSet.YES_NO);

      if (result == ui.Button.YES) {
        setFormatIssueResolved(issues_sheet, edit);
      } else {
        setFormatIssueAnsweredNotResolved(issues_sheet, edit)
      }
    }

    if ( allIssuesHaveBeenAnswered(issues_sheet) ) { highlightOpsHeader("white") };
    setCellEditNote(edit);
  }
}

function setFormatIssueResolved(issues_sheet, edit) {
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_sales_order_col), 1, 4).setBackground("#CCCCDC")
                                                                              .setFontWeight("normal")
                                                                              .setFontColor("#C0FFEE");
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_reply_col)).setBackground("#CCCCDC");
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_resolved_col)).check();
}

function setFormatIssueUnResolved(issues_sheet, edit) {
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_sales_order_col), 1, 4).setBackground("white")
                                                                              .setFontColor("black");
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_reply_col)).setBackground("white");
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_issue_col)).setBackground("#FF6969")
                                                                  .setFontWeight("bold");
}

function setFormatIssueAnsweredNotResolved(issues_sheet, edit) {
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_issue_col)).setBackground("#BADA55")
                                                                  .setFontWeight("bold")
                                                                  .setFontColor("black");
  issues_sheet.getRange(edit.range.getRow(), toNum(isu_resolved_col)).uncheck();
}

function prohibited_issues_sheet_edit(edit) {
  if ( edit.range.getColumn() == toNum(isu_reply_col) || ( edit.range.getColumn() == toNum(isu_resolved_col) ) ) {
    return false;
  } else {
    return true;
  }
}

function allIssuesHaveBeenAnswered(issues_sheet) {
  if ( noIssuesExist(issues_sheet) ) { return true };
  var issue_cells = issues_sheet.getRange(2, toNum(isu_issue_col), issues_sheet.getLastRow()-1, 1);
  var bgColors = issue_cells.getBackgrounds();
  for (var row in bgColors) {
    if (bgColors[row][0] == "#FF6969") { return false };
  }
  return true;
}

function noIssuesExist(issues_sheet) {
  if (issues_sheet.getLastRow() == 1) {return true} else {return false};
}

function highlightColHeader(ss, col, color) {
  var ss_range = ss.getRange(1, toNum(col));
  ss_range.setBackground(color);
}

function highlightOpsHeader(color) {
  var ss  = SpreadsheetApp.getActive().getSheetByName(oscar_sheet_name);
  var ss_range = ss.getRange(1, toNum(ops_col));
  ss_range.setBackground(color);
  ss_range.setValue("Ops Notes");
}

function manuallyDeleteIssue() {
  var ss_name = SpreadsheetApp.getActiveSheet().getName();
  var oscar = SpreadsheetApp.getActive();
  var isu_sheet = oscar.getSheetByName(issues_sheet_name);
  var cur_sheet = oscar.getSheetByName(oscar_sheet_name);
}
