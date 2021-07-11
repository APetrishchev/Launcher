package model

import (
	"database/sql"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	//_ "github.com/lib/pq"
	"Application/1.0.0/log_"
)

var log *log_.LogType

//==============================================================================
type DB struct {
  Host, User, Passwd, Name string
  Port int
  Log *log_.LogType
  connection *sql.DB
}

func (self *DB) Open() {
  log = self.Log
  log.Info.Printf("Database \"%s\" connect as %s@%s:%d ... ", self.Name, self.User, self.Host, self.Port)
  var err error
  if self.connection, err = sql.Open("sqlite3", self.Name); err != nil {
    panic(err)
  }

//   conStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
//     self.Host, self.Port, self.User, self.Passwd, self.Name)
//   if self.connection, err = sql.Open("postgres", conStr); err != nil {
//     panic(err)
//   }
//   if err = self.connection.Ping(); err != nil {
//     panic(err)
//   }

  log.Write.Println("OK")
}

func (self *DB) Close() {
  log.Info.Printf("Database close ... ")
  self.connection.Close()
  log.Write.Println("OK")
}

func (self *DB) Begin() *sql.Tx {
  tx, err := self.connection.Begin()
  if err != nil {
    panic(err)
  }
  return tx
}

func (self *DB) End(tx *sql.Tx) interface{} {
  msg := recover()
  if msg != nil {
    tx.Rollback()
  } else {
    tx.Commit()
  }
  return msg
}

func Int64ArrToString(arr []int64) string {
  ArrStr := make([]string, len(arr))
  for idx, val := range arr {
    ArrStr[idx] = strconv.FormatInt(val, 10)
  }
  return strings.Join(ArrStr, ",")
}
