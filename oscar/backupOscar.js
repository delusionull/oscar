function backupOscar() {
  var oscar, oscarBackup;
  oscar = SpreadsheetApp.getActiveSpreadsheet();
  
  if (userConfirmBackup()) { oscarBackup = createOscarBackup(oscar) } else { return }

  if (!fileExistsOnGDriveRoot(oscarBackup.getName())) {
    say("Something went wrong. The backup was not created.")
    return;
  }
  
  deleteAllButTwoBakSheets(oscar);
  clearIssuesLog(oscar);
}
