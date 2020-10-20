// Global OSCAR settings go here.

var wa_site_location            = "Dallas";

var oscar_index                 = 1;

var oscar_data_file_name        = "oscar.csv";
var oscar_sheet_name            = "current";
var incoming_sheet_name         = "incoming";
var vars_sheet_name             = "vars";
var components_sheet_name       = "Components";
var csr_action_sheet_name       = 'CSR Action Sheet';
var lookatme_sheet_name         = 'CHANGELOG';
var drsheet_name                = 'DRsheet';
var issues_sheet_name           = 'Issues';
var issues_log_sheet_name       = 'Issues Log';

var bak_sheets_warn_number      = 18;
var bak_sheets_limit_number     = 20;
var isu_log_max_rows            = 500;

var sales_order_col             = "A";
var so_suffix_col               = "B";
var shipdate_col                = "C";
var customer_col                = "E";
var status1_col                 = "F";
var ops_col                     = "J";
var csr_notes_col               = "K";
var shipping_notes_col          = "L";
var scheduled_col               = "M";
var material_pos_col            = "O";
var revenue_col                 = "P";
var weight_col                  = "Q";
var state_col                   = "S";
var reference_cell_col          = "T";

var oscar_first_edit_col        = status1_col;
var oscar_last_edit_col         = shipping_notes_col;

var oscar_edit_range            = oscar_first_edit_col + "2:" + oscar_last_edit_col;
var oscar_first_col             = sales_order_col;
var oscar_last_col              = "T";

var numerical_first_edit_col    = toNum(oscar_first_edit_col);
var num_of_edit_cols            = toNum(oscar_last_edit_col) - toNum(oscar_first_edit_col) + 1;

var update_range1_start_col     = so_suffix_col;
var update_range1_end_col       = customer_col;
var update_range2_start_col     = scheduled_col;
var update_range2_end_col       = state_col;

var isu_sales_order_col         = "A";
var isu_customer_col            = "B";
var isu_ship_date_col           = "C";
var isu_issue_col               = "D";
var isu_reply_col               = "E";
var isu_resolved_col            = "F";

var isu_log_resolved_time_col   = "G";

var isu_sheet_last_col          = "F";

var vars_sheet_today_date       = "B1";
var vars_sheet_recent_bak       = "$B$2";
var vars_sheet_last_timestamp   = "B3";

var override_on                 = false;

var oscar_maint_coders          = protected_oscar_maint_coders(); 
var oscar_editors               = protected_oscar_editors();
var oscar_backups_owner         = protected_oscar_backups_owner();
var csr_editors                 = protected_csr_editors();
var shipping_editors            = protected_shipping_editors();
var purch_editors               = protected_purch_editors();

// Your name doesn't need to be in here:
var oscar_test_coders           = protected_oscar_test_coders();
// Nor here:
var oscar_test_coder            = protected_oscar_test_coder();

// Number of holidays since last working day 
var holiday                     = 0;

// Some neat colors
var aero_blue                   = "#C0FFEE";
var conifer                     = "#BADA55";
var key_lime_pie                = "#B0BB1E";
var thistle                     = "#DEC0DE";
