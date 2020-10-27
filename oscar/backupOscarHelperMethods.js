function userConfirmBackup() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert("Confirm backup",
                          "This will:\n" +
                          "  1\) Create a backup copy of OSCAR\n" +
                          "  2\) Assign appropriate ownership and permissions to the backup\n" +
                          "  3\) Remove all but the two latest *current* sheet backups\n" +
                          "Do you want to continue?",
                          ui.ButtonSet.YES_NO);

  return (response == ui.Button.YES ? true : false)
}

function createOscarBackup(oscar) {
  var oscar_id = oscar.getId();
  var file = DriveApp.getFileById(oscar_id);
  var backup_file;
  backup_file = file.makeCopy(wa_site_location + ' OSCAR Backup: ' + isoDateString(_, 1));

  if (DriveApp.getFoldersByName("OSCAR").hasNext()) {
    var oscar_folder = DriveApp.getFoldersByName("OSCAR").next();
  } else {
    var oscar_folder = DriveApp.createFolder("OSCAR");
  }
  
  oscar_folder.addFile(backup_file);

  setOscarBackupPerms(backup_file)
  return backup_file;
}

function setOscarBackupPerms(oscar_backup) {
  oscar_backup.addEditors(oscar_editors);
  oscar_backup.setOwner(oscar_backups_owner);
}

function deleteAllButTwoBakSheets(oscar) {
  var sheets = oscar.getSheets();
  var bak_sheet_names = getSheetNamesThatEndWithBak(sheets);
  var sheet_to_delete;
  for (i = 0; i < bak_sheet_names.length -2; i++) {
    sheet_to_delete = oscar.getSheetByName(bak_sheet_names[i]);
    oscar.deleteSheet(sheet_to_delete);
  }
}

function clearIssuesLog(oscar) {
  var issues_log_sheet = oscar.getSheetByName(issues_log_sheet_name);
  if (issues_log_sheet.getLastRow() <= isu_log_max_rows) { return };
  issues_log_sheet.getRange("A2:" + isu_log_resolved_time_col).clear().clearNote().removeCheckboxes();
}

function getSheetNamesThatEndWithBak(sheets) {
  var bak_sheets = [];
  for (i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetName().substring(sheets[i].getSheetName().length - 3) === 'bak') {
      bak_sheets.push(sheets[i].getSheetName());
    }
  }
  return bak_sheets.sort();
}

function checkForOscarBloat(oscar) {
  var sheets = oscar.getSheets();
  var bak_sheet_names = getSheetNamesThatEndWithBak(sheets);
  if (bak_sheet_names.length > bak_sheets_limit_number) {
    say("    ***NOPE NOPE NOPE***\n\n" +
        "Sorry! You can't skip that backup any more!\n\n" +
        "The number of backup tabs has increased to: *** " + bak_sheet_names.length + " ***\n" +
        "This many backup tabs will slow OSCAR down.\n\n" +
        "Run the  Backup OSCAR  process, located in the menu under\n" +
        "----OSCAR Tools\n" +
        "-------->Scheduler.\n\n" +
        "Then, you may run the OSCAR update.")
    return false;
  }
  if (bak_sheet_names.length > bak_sheets_warn_number) {
    say("    ***BACKUP NEEDED***\n\n" +
        "Please run backup after update is complete!\n\n" +
        "The number of backup tabs has increased to: *** " + bak_sheet_names.length + " ***\n" +
        "This many backup tabs will slow the OSCAR down.\n\n" +
        "After the OSCAR update process has completed, please\n" +
        "run the  Backup OSCAR  process, located in the menu under\n" +
        "----OSCAR Tools\n" +
        "-------->Scheduler.")
  }
}
