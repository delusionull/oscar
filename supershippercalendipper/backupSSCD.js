function backupSscd() {
  var sscd, sscdBackup;
  sscd = SpreadsheetApp.getActiveSpreadsheet();
  
  if (userConfirmBackup()) { sscdBackup = createSscdBackup(sscd) } else { return }

  if (!fileExistsOnGDriveRoot(sscdBackup.getName())) {
    say("Something went wrong. The backup was not created.")
    return
  }
  
  deleteAllButTwoBakSheets(sscd);
}
