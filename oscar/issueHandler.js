function issueHandler(edit) {
  if ( isNotIssue(edit) ) { return };
  
  var oscar        = SpreadsheetApp.getActive();
  var issues_sheet = oscar.getSheetByName(issues_sheet_name);
  var oscar_sheet  = oscar.getSheetByName(oscar_sheet_name);
  var time_issue_added = ( isoDateString(_, 1) + " " + isoTimeString(_, 1) );
  var issue_rows = rowsWithRegexInColumn('^ISSUE!*', ops_col, oscar_sheet);
  var cur_isu_txt = edit.range.getValue();
  var old_isu_txt = edit.oldValue;
  var isu_note = edit.range.getNote();

  var osc_relevant_cells = oscar_sheet.getRange(2, toNum(sales_order_col), oscar_sheet.getLastRow() - 1, toNum(ops_col)).getValues();
  if ( noIssuesExist(issues_sheet) ) {
    var isu_relevant_cells = "";
  } else {
    var isu_relevant_cells = issues_sheet.getRange(2, toNum(isu_sales_order_col), issues_sheet.getLastRow() - 1, toNum(isu_issue_col)).getValues();
  }

  // This is merely okay; it actively removes any issue that is deleted.
  // But some kind of comprehensive cleanup is needed.
  if ( cur_isu_txt.indexOf("ISSUE!") == -1 ) {
    logAndRemoveIssue(edit, isu_relevant_cells, issues_sheet);
    sortIssuesSheet(issues_sheet);
    return;
  };

  for (row in issue_rows) {
    var issue_so = osc_relevant_cells[issue_rows[row]-2][toNum(sales_order_col)-1];
    var osc_issue = findOscarSheetIssueText(issue_so, osc_relevant_cells);
    var customer = osc_relevant_cells[issue_rows[row]-2][toNum(customer_col)-1];
    var ship_date = osc_relevant_cells[issue_rows[row]-2][toNum(shipdate_col)-1];
    if ( issueExists(issue_so, isu_relevant_cells) ) {
      var isu_issue = findIssueSheetIssueText(issue_so, isu_relevant_cells);
      if ( issueTextChanged(osc_issue, isu_issue) ) {
        Logger.log("so: " + issue_so + "; oscar issue: " + osc_issue + "; issues issue: " + isu_issue);
        updateIssueText(issue_so, customer, osc_issue, isu_note, ship_date, isu_relevant_cells, issues_sheet);
        highlightOpsHeader("red");
      }
    } else {
      addIssue(issue_so, customer, osc_issue, isu_note, ship_date, issues_sheet);
      highlightOpsHeader("red");
    }
  }
  sortIssuesSheet(issues_sheet);
}
