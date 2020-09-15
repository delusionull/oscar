function checkForNewData() {
  if (!(fileExistsOnGDriveRoot(oscar_data_file_name))) {
    say("File: \"" + oscar_data_file_name + "\" not found. Upload, please.");
    return false;
  }
}

function oscarSheetIsFirst(oscar, oscar_sheet) {
  if (oscar_sheet.getIndex() > 1) {
    oscar_sheet.activate();
    oscar.moveActiveSheet(1);
  }
}

function backupSheet(sheet, name) {
  var lookatme_sheet = sheet.getParent().getSheetByName(lookatme_sheet_name);
  unHideAllRows(sheet)

  var backup = sheet.copyTo(sheet.getParent());
  backup.setName(name + "_bak").activate();
  sheet.hideSheet();
  backup.getParent().moveActiveSheet(2);
  lookatme_sheet.activate();
  backup.hideSheet();
}

function importNewDataFromGdrive(incoming_sheet, oscar_data_file_name) {
  var oscar_data_file = DriveApp.getFilesByName(oscar_data_file_name).next();
  var csvData = Utilities.parseCsv(oscar_data_file.getBlob().getDataAsString());

  incoming_sheet.clear();
  incoming_sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);

  if (DriveApp.getFoldersByName("OSCAR").hasNext()) {
    var oscar_folder = DriveApp.getFoldersByName("OSCAR").next();
  } else {
    var oscar_folder = DriveApp.createFolder("OSCAR");
  }
  
  oscar_data_file.setName(oscar_data_file_name + "_" + isoDateString(new Date()) + "_" + isoTimeString() + ".bak");
  oscar_folder.addFile(oscar_data_file);
  //root_folder.removeFile(oscar_data_file);
}

function updateAddOrRemoveRows(o_sheet, i_sheet, d_sheet, o_sos, i_sos) {
  var oscar_index, incoming_index;
  var first_null_row = o_sheet.getLastRow();
  var range0_start   = toNum(oscar_first_col);
  var range0_end     = toNum(oscar_last_col);
  var range0_size    = (range0_end - range0_start) + 1;
  var range1_start   = toNum(update_range1_start_col);
  var range1_end     = toNum(update_range1_end_col);
  var range1_size    = (range1_end - range1_start) + 1;
  var range2_start   = toNum(update_range2_start_col);
  var range2_end     = toNum(update_range2_end_col);
  var range2_size    = (range2_end - range2_start) + 1;

  for (var i in i_sos) {
    oscar_index = ArrayLib.indexOf(o_sos, 0, i_sos[i][0]);
    if ((oscar_index >= 0)) {  // update a row
      i_sheet.getRange(+i + 1, range1_start, 1, range1_size).copyValuesToRange(o_sheet, range1_start, range1_end, oscar_index+2, oscar_index+2);
      i_sheet.getRange(+i + 1, range2_start, 1, range2_size).copyValuesToRange(o_sheet, range2_start, range2_end, oscar_index+2, oscar_index+2);
    } else {  // add a row
      first_null_row++;
      i_sheet.getRange(+i + 1, range0_start, 1, range0_size).copyValuesToRange(o_sheet, range0_start, range0_end, first_null_row, first_null_row);
    }
  }
  for (var i in o_sos) {
    incoming_index = ArrayLib.indexOf(i_sos, 0, o_sos[i][0]);
    if (incoming_index == -1) {  // clear a row
      // Comment clearing does not work, and Google doesn't care: https://issuetracker.google.com/issues/36756650
      o_sheet.getRange(+i + 2, 1, 1, toNum(oscar_last_col)).clearContent()
                                                           .clearNote()
                                                           .clear({commentsOnly: true})
                                                           .setBackground("white");
    }
  }
}

// Deprecated
function insertDrsNote(o_sheet, all_drs, sales_order, row) {
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
  var cell = o_sheet.getRange(material_pos_col + row);
  cell.setNote(drs_only.join("\n"));
}

function setVarsSheetValues(sheet, last, curr) {
  sheet.getRange(vars_sheet_recent_bak).setValue(last + "_bak");
  sheet.getRange(vars_sheet_last_timestamp).setValue(curr);
}

// Deprecated
function insertLookupFormulas(sheet, row) {
  sheet.getRange(row, toNum(weightperdate_col), 1, 1)
    .setFormula("=if(AND(\n" +
                "    indirect(\"$" + shipdate_col + "\"&(row())) = INDIRECT(\n" +
                "      ADDRESS(ROW()-1," + toNum(shipdate_col) + ",3)),\n" +
                "    indirect(\"$" + shipvia_col + "\"&(row())) = INDIRECT(\n" +
                "      ADDRESS(ROW()-1," + toNum(shipvia_col) + ",3))\n" +
                "    ),\n" +
                "  \"\",\n" +
                "  SUMIFS(\n" +
                "    indirect(\"$" + weight_col + "\"&(row())&\":" + weight_col + "\"),\n" +
                "    indirect(\"$" + shipdate_col + "\"&(row())&\":" + shipdate_col + "\"),\"=\" & indirect(\"$" + shipdate_col + "\"&(row())),\n" +
                "    indirect(\"$" + shipvia_col + "\"&(row())&\":" + shipvia_col + "\"),\"=\" & indirect(\"$" + shipvia_col + "\"&(row()))\n" +
                "  )\n" +
                ")\n")
}

function renameOscarWithCurrentTimestamp(ss, timestamp) {
  var oscar_name = ss.getName();
  ss.rename(oscar_name.replace(/; .*/, ";  ( update ran: ") + timestamp + " )");
}

function setReferenceCells(oscar_sheet) {
  oscar_sheet.getRange(reference_cell_col + 1).setValue(isoDateString(_, 1));
}

function fancySort(sheet_to_sort) {
  var ss_range = sheet_to_sort.getRange("A2:" + oscar_last_col);
  ss_range.sort([{column: toNum(shipdate_col),    ascending: true},
                 {column: toNum(customer_col),    ascending: true},
                 {column: toNum(sales_order_col), ascending: true},
                 {column: toNum(so_suffix_col),   ascending: true}]);
}
