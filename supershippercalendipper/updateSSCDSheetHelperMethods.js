function checkForNewData() {
  if (!(fileExistsOnGDriveRoot(sscd_data_file_name))) {
    say("File: \"" + sscd_data_file_name + "\" not found. Upload, please.");
    return false;
  }
}

function sscdSheetIsFirst(sscd, sscd_sheet) {
  if (sscd_sheet.getIndex() > 1) {
    sscd_sheet.activate();
    sscd.moveActiveSheet(1);
  }
}

function backupSheet(sheet, name) {
  var lookitme_sheet = sheet.getParent().getSheetByName(lookitme_sheet_name);
  unHideAllRows(sheet)

  var backup = sheet.copyTo(sheet.getParent());
  backup.setName(name + "_bak").activate();
  sheet.hideSheet();
  backup.getParent().moveActiveSheet(2);
  lookitme_sheet.activate();
  backup.hideSheet();
}

//function backupSheet(sheet, name) {
//  sheet.hideSheet();
//  unHideAllRows(sheet)
//
//  var backup = sheet.copyTo(sheet.getParent());
//  backup.setName(name + "_bak").activate();
//  backup.getParent().moveActiveSheet(2);
//  backup.showSheet();
//  backup.hideSheet();
//}

function importNewDataFromGdrive(incoming_sheet, sscd_data_file_name) {
  var root_folder = DriveApp.getRootFolder();
  var sscd_data_file = root_folder.getFilesByName(sscd_data_file_name).next();
  var csvData = Utilities.parseCsv(sscd_data_file.getBlob().getDataAsString());

  incoming_sheet.clear();
  incoming_sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);

  if (DriveApp.getFoldersByName("SSCD").hasNext()) {
    var sscd_folder = DriveApp.getFoldersByName("SSCD").next();
  } else {
    var sscd_folder = root_folder.createFolder("SSCD");
  }
  
  sscd_data_file.setName(sscd_data_file_name + "_" + isoDateString(new Date()) + "_" + isoTimeString() + ".bak");
  root_folder.removeFile(sscd_data_file);
  sscd_folder.addFile(sscd_data_file);
}

function updateAddOrRemoveRows(s_sheet, i_sheet, s_sos, i_sos) {
  var sscd_first_empty_row = s_sheet.getLastRow();
  var sscd_index;
  var incoming_index;
  var first_update_range_start_num  = toNum(shipdate_column);
  var first_update_range_end_num    = toNum(apdmove_column);
  var first_update_range_size       = (first_update_range_end_num - first_update_range_start_num) + 1;
  var second_update_range_start_num = toNum(material_pos_column);
  var second_update_range_end_num   = toNum(sales_column);
  var second_update_range_size      = (second_update_range_end_num - second_update_range_start_num) + 1;

  for (var i in i_sos) {
    sscd_index = ArrayLib.indexOf(s_sos, 0, i_sos[i][0]);
    if ((sscd_index >= 0)) {  // update row
      i_sheet.getRange(+i + 1, first_update_range_start_num, 1, first_update_range_size)
        .copyValuesToRange(s_sheet, first_update_range_start_num, first_update_range_end_num, sscd_index+2, sscd_index+2);
      i_sheet.getRange(+i + 1, second_update_range_start_num, 1, second_update_range_size)
        .copyValuesToRange(s_sheet, second_update_range_start_num, second_update_range_end_num, sscd_index+2, sscd_index+2);
    } else {  // add row
      sscd_first_empty_row++;
      i_sheet.getRange(+i + 1, toNum(sales_order_column), 1, toNum(sscd_last_column))
        .copyValuesToRange(s_sheet, toNum(sales_order_column), toNum(sscd_last_column), sscd_first_empty_row, sscd_first_empty_row);
      insertLookupFormulas(s_sheet, sscd_first_empty_row);
    }
    // NEW FEATURE:
    // For each sales order (i), parse DRsheet, returning array of DR's, placing /n-
    // separated list in "Material PO" cell of the respective sales order.
  }
  for (var i in s_sos) {
    incoming_index = ArrayLib.indexOf(i_sos, 0, s_sos[i][0]);
    if (incoming_index == -1) {  // clear row
      // Comment clearing does not work, and Google doesn't care:
      // https://issuetracker.google.com/issues/36756650
      s_sheet.getRange(+i + 2, 1, 1, toNum(sscd_last_column)).clearContent().clearNote().clear({commentsOnly: true}).setBackground("white");
    }
  }
}

function setVarsSheetValues(sheet, last, curr) {
  sheet.getRange(vars_sheet_recent_bak).setValue(last + "_bak");
  sheet.getRange(vars_sheet_last_timestamp).setValue(curr);
}

function insertLookupFormulas(sheet, row) {
  sheet.getRange(row, toNum(changes_column), 1, 1)
    .setFormula("=IFERROR(\n" +
                "  IF(\n" +
                "    VLOOKUP(\n" +
                "      indirect(\"$A\"&(row())),\n" +
                "      INDIRECT(vars!" + vars_sheet_recent_bak + "&\"!A2:W800\"),\n" +
                "      COLUMN()+1,\n" +
                "      FALSE\n" +
                "    )=indirect(\"$C\"&(row())),\n" +
                "    \"\",\n" + "    VLOOKUP(\n" +
                "      indirect(\"$A\"&(row())),\n" +
                "      INDIRECT(vars!" + vars_sheet_recent_bak + "&\"!A2:W800\"),\n" +
                "      COLUMN()+1,\n" + "      FALSE\n" +
                "    )\n" +
                "  ),\"NEW\")")
  sheet.getRange(row, toNum(weightperdate_column), 1, 1)
    .setFormula("=if(AND(\n" +
                "    indirect(\"$" + shipdate_column + "\"&(row())) = INDIRECT(\n" +
                "      ADDRESS(ROW()-1," + toNum(shipdate_column) + ",3)),\n" +
                "    indirect(\"$" + shipvia_column + "\"&(row())) = INDIRECT(\n" +
                "      ADDRESS(ROW()-1," + toNum(shipvia_column) + ",3))\n" +
                "    ),\n" +
                "  \"\",\n" +
                "  SUMIFS(\n" +
                "    indirect(\"$" + weight_column + "\"&(row())&\":" + weight_column + "\"),\n" +
                "    indirect(\"$" + shipdate_column + "\"&(row())&\":" + shipdate_column + "\"),\"=\" & indirect(\"$" + shipdate_column + "\"&(row())),\n" +
                "    indirect(\"$" + shipvia_column + "\"&(row())&\":" + shipvia_column + "\"),\"=\" & indirect(\"$" + shipvia_column + "\"&(row()))\n" +
                "  )\n" +
                ")\n")
}

function renameSscdWithCurrentTimestamp(ss, timestamp) {
  var sscd_name = ss.getName();
  ss.rename(sscd_name.replace(/; .*/, ";  ( update ran: ") + timestamp + " )");
}

function setReferenceCells(sscd_sheet) {
  sscd_sheet.getRange("AA1").setValue(isoDateString(_, 1));
}

function fancySort(sheet_to_sort) {
  var ss_range = sheet_to_sort.getRange("A2:AB");
  ss_range.sort([{column: toNum(shipdate_column),    ascending: true},
                 {column: toNum(shipvia_column),     ascending: true},
                 {column: toNum(so_type_column),     ascending: true},
                 {column: toNum(customer_column),    ascending: true},
                 {column: toNum(numeric_so_column),  ascending: true}]);
}
