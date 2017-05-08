// Set a note on the edited cell to indicate when it was changed.
function setCellEditNote(edit) {
  var time_of_edit = ( isoDateString() + " " + isoTimeString(_, 1) );
  var old_value = ( Boolean(edit.oldValue) ? edit.oldValue : "blank" );
  var prev_cell_note = ( edit.range.getNote() ? edit.range.getNote() : "[original value]:\n" + old_value );
  var new_note = (csrActionNoteText(edit) || highlightOverrideText(edit) || cellDeletedText(edit) || edit.range.getValue() );
  edit.range.setNote( "[edit: " + time_of_edit + "]:\n" +
                new_note + "\n\n" +
                prev_cell_note );
}

function csrActionNoteText(edit) {
  if (edit.range.getColumn() == toNum(mtg_notes_column)) {
    if (edit.range.getValue() == "#") {
      var new_cell_text = "#" + isoDateString() + "\n" + (edit.oldValue ? edit.oldValue : '');
      edit.range.setValue(new_cell_text);
      return new_cell_text;
    } else if (/#( |$)/m.test(edit.range.getValue())) {
      var new_cell_text = edit.range.getValue().replace(/(.*)(#)( |$)(.*)/m, '$1$2' + isoDateString() + '\n$4');
      edit.range.setValue(new_cell_text);
      return new_cell_text;
    }
  }
}

function highlightOverrideText(edit) {
  if (edit.range.getValue() === "!!!") {
    var new_cell_text = (edit.oldValue ? edit.oldValue + ' ' : ' ');  // non-breaking space for cond. highlight override
    edit.range.setValue(new_cell_text);
    return "[highlight override]\n" + new_cell_text;
  } else if (/( )/m.test(edit.range.getValue())) {
    var new_cell_text = edit.range.getValue();
    return "[highlight override]\n" + new_cell_text;
  }
}

function cellDeletedText(edit) { return ( edit.range.isBlank() ? "{contents deleted}" : null ) }

function isMultiCellEdit(edit) { return ( (edit.range.getNumRows() + edit.range.getNumColumns() > 2) ? true : false ) }

function isNonMainSheetEdit(edit) { return ( (edit.range.getSheet().getIndex() !== sscd_index) ? true : false ) }

function isNonEdit(edit) { return ( ((edit.oldValue || "") === edit.range.getValue()) ? true : false ) }

function undoProhibitedEdit(edit) {
  if ( isHeaderRowEdit(edit) || isProhibitedColumnEdit(edit) ) { undoEdit(edit); return true; } else { return false }
}

function override() { if (override_on === true && Session.getActiveUser().getEmail() === sscd_coder) { return true } }

function isHeaderRowEdit(edit) { return ( (edit.range.getRow() === 1) ? true : false ) }

function isProhibitedColumnEdit(edit) {
  return ( (edit.range.getColumn() < first_edit_column ||
            edit.range.getColumn() >= first_edit_column + num_of_edit_columns) ? true : false )
}

function undoEdit(edit) { edit.range.setValue(edit.oldValue ? edit.oldValue : '') }

