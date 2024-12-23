function jumpToIssueOnOtherTab() {
  const ss_name = SpreadsheetApp.getActiveSheet().getName();
  const oscar = SpreadsheetApp.getActive();
  const isu_sheet = oscar.getSheetByName(issues_sheet_name);
  const cur_sheet = oscar.getSheetByName(oscar_sheet_name);
  
  if (ss_name == issues_sheet_name ) {
    var so = isu_sheet.getRange(isu_sheet.getCurrentCell().getRow(), toNum(isu_sales_order_col)).getValue();
    const rowfound = findInColumn(cur_sheet, sales_order_col, so);
    if (so == "" || so == "SO" || rowfound < 0) { cur_sheet.getRange(1, 1).activate(); return }
    cur_sheet.getRange(rowfound, toNum(ops_col)).activate();
  } else if (ss_name == oscar_sheet_name ) {
    if (cur_sheet.getRange(cur_sheet.getCurrentCell().getRow(), toNum(ops_col)).getDisplayValue().indexOf("ISSUE!")>-1) {
      var so = cur_sheet.getRange(cur_sheet.getCurrentCell().getRow(), toNum(sales_order_col)).getValue();
      isu_sheet.getRange(findInColumn(isu_sheet, isu_sales_order_col, so), toNum(isu_issue_col)).activate();
    } else { isu_sheet.getRange(1, 1).activate() };
  } else {
    return;
  }
};
