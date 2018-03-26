#!/usr/bin/env ruby
# Set up data connections for LWI Portal Update Daemon

require 'sequel'

# LOCATION should be set to 'Dal' (Dallas) or 'KC' (Kansas City)
LOCATION = 'Dal'
TEST = 'NO'

MAS90_PATH = 'W:\\shazam\\' +
               "#{'Data Update\\' if LOCATION == 'KC'}" +
               "#{TEST == 'YES' ? 'KC_Mas90.mdb' : 'Mas90 Data Copy.mdb'}"
SCHED_PATH = 'W:\\shazam\\' +
               "#{TEST == 'YES' ? 'Schedule Shazam KC_be.mdb' : 'Schedule Shazam Dal_NEW.mdb'}"

connection_string = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source='
#connection_string = 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source='
DB_SCHED = Sequel.ado(:conn_string=>connection_string + SCHED_PATH)
DB_MAS90 = Sequel.ado(:conn_string=>connection_string + MAS90_PATH) 

