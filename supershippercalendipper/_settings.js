// Global SSCD settings go here.

var sscd_index                  = 1;

var sscd_data_file_name         = "sscd.csv";
var sscd_sheet_name             = "current";
var incoming_sheet_name         = "incoming";
var vars_sheet_name             = "vars";
var components_sheet_name       = "Components";
var csr_action_sheet_name       = 'CSR Action Sheet';
var lookitme_sheet_name         = 'CHANGELOG';

var first_edit_column           = 9;
var num_of_edit_columns         = 9;

var sscd_edit_range             = "I2:Q";
var sscd_last_column            = "AB";

var sales_order_column          = "A";
var changes_column              = "B";
var shipdate_column             = "C";
var so_type_column              = "D";
var gross_margin_column         = "F";
var customer_column             = "G";
var apdmove_column              = "H";
var mtg_notes_column            = "L";
var csr_notes_column            = "O";
var shipping_notes_column       = "P";
var purch_notes_column          = "Q";
var material_pos_column         = "R";
var revenue_column              = "T";
var weight_column               = "U";
var shipvia_column              = "V";
var sales_column                = "Y";
var weightperdate_column        = "Z";
var numeric_so_column           = "AB";

var vars_sheet_today_date       = "B1";
var vars_sheet_recent_bak       = "$B$2";
var vars_sheet_last_timestamp   = "B3";

var override_on                 = false;
var sscd_maint_coders           = ["***REMOVED***", "***REMOVED***", "***REMOVED***"]; 
var sscd_editors                = ["***REMOVED***", "***REMOVED***", "***REMOVED***", "***REMOVED***", "***REMOVED***"];
var sscd_backups_owner          = "***REMOVED***";
var csr_editors                 = ["***REMOVED***", "***REMOVED***", "***REMOVED***", "***REMOVED***"];
var shipping_editors            = ["***REMOVED***", "***REMOVED***", "***REMOVED***"];
var purch_editors               = ["***REMOVED***", "***REMOVED***"];

// Your name doesn't need to be in here:
var sscd_test_coders            = ["***REMOVED***"];
// Nor here:
var sscd_test_coder             = "***REMOVED***";

// Number of holidays since last working day 
var holiday                     = 0;
