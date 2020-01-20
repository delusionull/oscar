require 'oci8'
require 'sequel'
require_relative 'credentials'

module Oscar
  module DBs
    # https://github.com/kubo/ruby-oci8/issues/28
    OCI8::BindType::Mapping[Time] = OCI8::BindType::LocalTime
    OCI8::BindType::Mapping[:date] = OCI8::BindType::LocalTime

    TEST = 'NO'

    INFOR_DB   = '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)' +
                   "(HOST=#{TEST == 'YES' ? '***REMOVED***' : '***REMOVED***'}" +
                   ')(PORT=***REMOVED***))(CONNECT_DATA=(SID=' +
                   "#{TEST == 'YES' ? '***REMOVED***' : '***REMOVED***'})))"

    DB_INFOR = Sequel.connect(adapter: 'oracle',
                              user: Oscar::Credentials::USR,
                              password: Oscar::Credentials::PWD,
                              database: INFOR_DB)

    SCHED_PATH = 'Y:\\shazam\\Schedule Shazam Dal_NEW.mdb'

    connection_string = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source='
    DB_SCHED = Sequel.ado(:conn_string=>connection_string + SCHED_PATH) 
  end
end

