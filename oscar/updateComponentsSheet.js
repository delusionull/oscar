function updateComponentsSheet() {
  var oscar = SpreadsheetApp.getActive();
  var components_sheet = oscar.getSheetByName(components_sheet_name);
  unHideAllRows(components_sheet)
  components_sheet.getRange(2, 1).setFormula(
    "=QUERY(" + oscar_sheet_name + "!A2:Y; \"select * where (" + 
                                                 so_type_col + " contains 'com' or " + 
                                                 so_type_col + " contains 'psa' or " + 
                                                 so_type_col + " contains 'ele' or " + 
                                                 so_type_col + " contains 'tp')\")");
  hideEmptyRows(components_sheet)
}
