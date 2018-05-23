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
  sscd_folder.addFile(sscd_data_file);
  //root_folder.removeFile(sscd_data_file);
}

function updateAddOrRemoveRows(s_sheet, i_sheet, d_sheet, s_sos, i_sos) {
  var sscd_index, incoming_index;
  var first_null_row = s_sheet.getLastRow();
  var range0_start   = toNum(sales_order_column);
  var range0_end     = toNum(sscd_last_column);
  var range0_size    = (range0_end - range0_start) + 1;
  var range1_start   = toNum(shipdate_column);
  var range1_end     = toNum(apdmove_column);
  var range1_size    = (range1_end - range1_start) + 1;
  var range2_start   = toNum(material_pos_column);
  var range2_end     = toNum(sales_column);
  var range2_size    = (range2_end - range2_start) + 1;
  var all_drs        = d_sheet.getRange(2, 1, d_sheet.getLastRow() - 1, 6).getValues();

  for (var i in i_sos) {
    sscd_index = ArrayLib.indexOf(s_sos, 0, i_sos[i][0]);
    if ((sscd_index >= 0)) {  // update a row
      i_sheet.getRange(+i + 1, range1_start, 1, range1_size).copyValuesToRange(s_sheet, range1_start, range1_end, sscd_index+2, sscd_index+2);
      i_sheet.getRange(+i + 1, range2_start, 1, range2_size).copyValuesToRange(s_sheet, range2_start, range2_end, sscd_index+2, sscd_index+2);
      insertDrsNote(s_sheet, all_drs, i_sos[i][0], sscd_index+2);
    } else {  // add a row
      first_null_row++;
      i_sheet.getRange(+i + 1, range0_start, 1, range0_size).copyValuesToRange(s_sheet, range0_start, range0_end, first_null_row, first_null_row);
      insertLookupFormulas(s_sheet, first_null_row);
      insertDrsNote(s_sheet, all_drs, i_sos[i][0], first_null_row);
    }
  }
  for (var i in s_sos) {
    incoming_index = ArrayLib.indexOf(i_sos, 0, s_sos[i][0]);
    if (incoming_index == -1) {  // clear a row
      // Comment clearing does not work, and Google doesn't care: https://issuetracker.google.com/issues/36756650
      s_sheet.getRange(+i + 2, 1, 1, toNum(sscd_last_column)).clearContent()
                                                             .clearNote()
                                                             .clear({commentsOnly: true})
                                                             .setBackground("white");
    }
  }
}

//function insertDrsNote() {
function insertDrsNote(s_sheet, all_drs, sales_order, row) {
  var drs      = ArrayLib.filterByText(all_drs, 0, sales_order);
  var drs_only = [];
  
  if (drs.length > 0) {
    for (var i = 0, len = drs.length; i < len; i++) {
      drs_only.push(                        "DR" + drs[i][1] +
                    (drs[i][2] !== null && drs[i][2] !== '' ? ": "     + drs[i][2] : "") +
                    (drs[i][3] !== null && drs[i][3] !== '' ? " L"     + drs[i][3] : "") +
                    (drs[i][4] !== null && drs[i][4] !== '' ? "; "     + drs[i][4] : "") +
                    (drs[i][5] instanceof Date              ? " - "    + (drs[i][5].getMonth() + 1) + "/" + drs[i][5].getDate() : ""));
    }
  }
  var cell = s_sheet.getRange(material_pos_column + row);
  cell.setNote(drs_only.join("\n"));
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
