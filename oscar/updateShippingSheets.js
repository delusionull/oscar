function updateShippingSheets() {
  var shipping_today_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ShippingToday");
  var shipping_tomorrow_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ShippingTomorrow");

  unHideAllRows(shipping_today_sheet)
  unHideAllRows(shipping_tomorrow_sheet)

  shipping_today_sheet.getRange(2, 1).setFormula(
    "=QUERY(" + sscd_sheet_name + "!A2:Y; \"select * where " + shipdate_column + " <= date '" + isoDateString(new Date(), 1) + "' and " + shipdate_column + " is not null \")" );
  shipping_tomorrow_sheet.getRange(2, 1).setFormula(
    "=QUERY(" + sscd_sheet_name + "!A2:Y; \"select * where " + shipdate_column + " = date '" + isoDateString(incrementBusinessDateBy(new Date(), +1), 1) + "' \")" );

  hideEmptyRows(shipping_today_sheet)
  hideEmptyRows(shipping_tomorrow_sheet)
}
