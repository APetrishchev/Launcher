package model

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	//_ "github.com/lib/pq"
	"Application/1.0.0/log_"
)

var log *log_.LogType

//==============================================================================
type DBType struct {
  Host, User, Passwd, Name string
  Port int
  Log *log_.LogType
  connection *sql.DB
  tx *sql.Tx
}

var DbInstance *DBType

func Db(log *log_.LogType, host string, port int, user string, passwd string, name string) (*DBType) {
	DbInstance = &DBType{
		Log: log,
		Host: host,
		Port: port,
		User: user,
		Passwd: passwd,
		Name: name,
	}
  return DbInstance
}

func (self *DBType) Open() {
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

func (self *DBType) Close() {
  log.Info.Printf("Database close ... ")
  self.connection.Close()
  log.Write.Println("OK")
}

func (self *DBType) Begin() {
  var err error
  if self.tx, err = self.connection.Begin(); err != nil {
    panic(err)
  }
}

func (self *DBType) End() interface{} {
  msg := recover()
  if msg != nil {
    self.tx.Rollback()
  } else {
    self.tx.Commit()
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

func (self *DBType) CheckError(err error) {
  if err != nil {
    self.Log.Write.Printf("FAIL\nError: %s\n", err)
    panic(err)
  } else {
    self.Log.Write.Println("OK")
  }
}

func (self *DBType) CreateTable(tbl string, fields []string, tail string) {
  self.Log.Write.Println()
  self.Log.Write.Printf("Create table \"%s\" ... ", tbl)
  if _, err := self.connection.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tbl)); err != nil {
    self.Log.Error.Println(err)
  } else {
    query := fmt.Sprintf("CREATE TABLE `%s` (\n", tbl)
    query = query + strings.Join(fields[:], ",\n")
    if tail != "" {
      query = query + ",\n" + tail
    }
    query = query + "\n)\n"
    _, err := self.connection.Exec(query)
    self.CheckError(err)
  }
}
