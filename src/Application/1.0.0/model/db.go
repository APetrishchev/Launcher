package model

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	//_ "github.com/lib/pq"
)

func map2arrays(fields *map[string]interface{}) (*[]string, *[]interface{}) {
  keys := make([]string, len(*fields))
  values := make([]interface{}, len(*fields))
  idx := 0
  for key, value := range *fields {
    keys[idx] = key
    values[idx] = value
    idx += 1
  }
  return &keys, &values
}

//==============================================================================
type DbType struct {
  Host, User, Passwd, Name string
  Port int
  conn *sql.DB
  tx *sql.Tx
}

var Db *DbType

func (self *DbType) Open() (err error) {
  self.conn, err = sql.Open("sqlite3", self.Name)
  Db = self
  return err

//   conStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
//   self.conn, err = sql.Open("postgres", conStr)
//   return err

//   if err = self.conn.Ping(); err != nil {
//     panic(err)
//   }
}

func (self *DbType) Close() {
  self.conn.Close()
}

func (self *DbType) Begin() {
  var err error
  if self.tx, err = self.conn.Begin(); err != nil {
    panic(err)
  }
}

func (self *DbType) End() interface{} {
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

func (self *DbType) CreateTable(tbl string, fields []string, tail string) (err error) {
  if _, err = self.conn.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tbl)); err == nil {
    query := fmt.Sprintf("CREATE TABLE `%s` (\n", tbl)
    query = query + strings.Join(fields[:], ",\n")
    if tail != "" {
      query = query + ",\n" + tail
    }
    query = query + "\n)\n"
    _, err = self.conn.Exec(query)
  }
  return err
}

func (self *DbType) Get_(tab string, select_ string, where string, values *[]interface{}) (*sql.Rows, error) {
  return self.conn.Query(fmt.Sprintf("SELECT %s FROM %s WHERE %s", select_, tab, where), *values...)
}

func (self *DbType) Add_(tab string, fields *map[string]interface{}) int64 {
  keys, values := map2arrays(fields)
  res, err := self.conn.Exec(
    "INSERT INTO " + tab + " (" + strings.Join(*keys, ",") +
    ") VALUES (" + strings.Repeat("?,", len(*fields)-1) + "?);",
    *values...)
  if err != nil {
    panic(err)
  }
  id, err := res.LastInsertId()
  if err != nil {
    panic(err)
  }
  return id
}

func (self *DbType) Upd_(tab string, id interface{}, fields *map[string]interface{}) (err error) {
  keys, values := map2arrays(fields)
  *values = append(*values, id)
  _, err = self.conn.Exec(
    "UPDATE INTO " + tab + " (" + strings.Join(*keys, ",") +
    ") VALUES (" + strings.Repeat("?,", len(*fields)-1) + "?) WHERE Id=?;",
    *values...)
  return err
}

func (self *DbType) Del_(tab string, ids []interface{}) (err error) {
  var query = strings.Repeat("DELETE FROM " + tab + " WHERE Id=?;", len(ids))
  _, err = self.conn.Exec(query, ids...)
  return err
}
