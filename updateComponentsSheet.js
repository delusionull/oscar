function updateComponentsSheet() {
  var sscd = SpreadsheetApp.getActive();
  var components_sheet = sscd.getSheetByName(components_sheet_name);
  unHideAllRows(components_sheet)
  components_sheet.getRange(2, 1).setFormula(
    "=QUERY(" + sscd_sheet_name + "!A2:Y; \"select * where (" + 
                                                 so_type_column + " contains 'com' or " + 
                                                 so_type_column + " contains 'psa' or " + 
                                                 so_type_column + " contains 'ele' or " + 
                                                 so_type_column + " contains 'tp')\")");
  hideEmptyRows(components_sheet)
}

