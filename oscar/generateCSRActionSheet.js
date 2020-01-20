/**
 * Creates a new sheet containing "Action Items" based on a query for
 * a certain string in the "MTG Notes" column.
 */
function generateCsrActionSheet() {
  var ss = SpreadsheetApp.getActive();
  var oscar_sheet = ss.getSheetByName(oscar_sheet_name);
  var formatting_source_range = oscar_sheet.getRange("A2:W2");
  
  keyword_search = Browser.inputBox("Action Item Keyword",
                                    "Enter desired Action Item Keyword\\n" +
                                    "(date-based, e.g.: #20161208)\\n\\n" +
                                    "or leave blank to include all Action\\n" +
                                    "Items on current OSCAR sheet:\\n" +
                                    "\\n ",
                                    Browser.Buttons.OK_CANCEL);
  if (keyword_search == 'cancel') {
    return;
  } else if (keyword_search == '') {
    var action_item_keyword = '#';
  } else {
    var action_item_keyword = keyword_search;
  }

  // Create a new sheet and load the query.
  var action_sheet = ss.getSheetByName(csr_action_sheet_name);
  if (action_sheet) {
    action_sheet.clear();
    action_sheet.activate();
    action_sheet.insertRows(1, 50);
  } else {
    action_sheet =
        ss.insertSheet(csr_action_sheet_name, ss.getNumSheets());
  }
  
  // Copy the header row.
  oscar_sheet.getRange(1, 1, 1, oscar_sheet.getLastColumn())
             .copyTo(action_sheet.getRange("A1"), {contentsOnly:true});

  // Insert query to retrieve the rows containing the search string ("#" + current sheet name)
  action_sheet.getRange(2, 1)
              .setFormula(
                "=QUERY(" + oscar_sheet_name + "!A2:W500; \"select * where " + mtg_notes_col + " contains '" + action_item_keyword + "'\")"
              );
 
   // Freezes zero rows (yay for coding with friends!)
  freeze1Row1Col(action_sheet, 0);
  
  // Deletes empty rows.
  action_sheet.deleteRows(action_sheet.getLastRow() + 1, action_sheet.getMaxRows() - action_sheet.getLastRow());
    
  freeze1Row1Col(action_sheet, 1);
  
  // Copies the Action Sheet values to itself, overwriting the formula.
  var action_sheet_data_range = action_sheet.getDataRange();
  action_sheet_data_range.copyValuesToRange(action_sheet, 1, 23, 1, action_sheet.getLastRow());

  // Copies the formatting in formatting_source_range to A1:W500 in the second sheet
  formatting_source_range.copyFormatToRange(action_sheet, 1, 23, 1, action_sheet.getLastRow());
  
  SpreadsheetApp.flush();
}
