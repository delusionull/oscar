function userConfirmBackup() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert("Confirm backup",
                          "This will:\n" +
                          "  1\) Create a backup copy of the SuperShipperCalendipper\n" +
                          "  2\) Assign appropriate ownership and permissions to the backup\n" +
                          "  3\) Remove all but the two latest *current* sheet backups\n" +
                          "Do you want to continue?",
                          ui.ButtonSet.YES_NO);

  return (response == ui.Button.YES ? true : false)
}

function createSscdBackup(sscd) {
  var sscd_id = sscd.getId();
  var file = DriveApp.getFileById(sscd_id);
  var backup_file;
  backup_file = file.makeCopy(lw_site_location + ' SSCD Backup: ' + isoDateString(_, 1));
  setSscdBackupPerms(backup_file)
  return backup_file;
}

function setSscdBackupPerms(sscd_backup) {
  sscd_backup.addEditors(sscd_editors);
  sscd_backup.setOwner(sscd_backups_owner);
}

function deleteAllButTwoBakSheets(sscd) {
  var sheets = sscd.getSheets();
  var bak_sheet_names = getSheetNamesThatEndWithBak(sheets);
  var sheet_to_delete;
  for (i = 0; i < bak_sheet_names.length -2; i++) {
    sheet_to_delete = sscd.getSheetByName(bak_sheet_names[i]);
    sscd.deleteSheet(sheet_to_delete);
  }
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

function checkForSscdBloat(sscd) {
  var sheets = sscd.getSheets();
  var bak_sheet_names = getSheetNamesThatEndWithBak(sheets);
  if (bak_sheet_names.length > 20) {
    say("    ***BACKUP NEEDED***\n\n" +
        "Please run backup after update is complete!\n\n" +
        "The number of backup sheets has increased to " + bak_sheet_names.length + ".\n" +
        "This many backup sheets will slow the SSCD down.\n" +
        "After the SSCD update process has completed, please\n" +
        "run the  Backup SSCD  process, located in the menu under\n" +
        "--SSCD Tools\n" +
        "--->Scheduler.")
  }
}
