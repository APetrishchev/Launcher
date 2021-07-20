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
type DBType struct {
  Host, User, Passwd, Name string
  Port int
  connection *sql.DB
  tx *sql.Tx
}

var DbInstance *DBType

func Db(host string, port int, user string, passwd string, name string) (*DBType) {
	DbInstance = &DBType{
		Host: host,
		Port: port,
		User: user,
		Passwd: passwd,
		Name: name,
	}
  return DbInstance
}

func (self *DBType) Open() (err error) {
  self.connection, err = sql.Open("sqlite3", self.Name)
  return err

//   conStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
//   self.connection, err = sql.Open("postgres", conStr)
//   return err

//   if err = self.connection.Ping(); err != nil {
//     panic(err)
//   }

}

func (self *DBType) Close() {
  self.connection.Close()
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

func (self *DBType) CreateTable(tbl string, fields []string, tail string) (err error) {
  if _, err = self.connection.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tbl)); err == nil {
    query := fmt.Sprintf("CREATE TABLE `%s` (\n", tbl)
    query = query + strings.Join(fields[:], ",\n")
    if tail != "" {
      query = query + ",\n" + tail
    }
    query = query + "\n)\n"
    _, err = self.connection.Exec(query)
  }
  return err
}

func (self *DBType) Get_(tab string, select_ string, where string, values *[]interface{}) (*sql.Rows, error) {
  return self.connection.Query(fmt.Sprintf("SELECT %s FROM %s WHERE %s", select_, tab, where), *values...)
  // defer rows.Close()
}

func (self *DBType) Add_(tab string, fields *map[string]interface{}) (int64, error) {
  keys, values := map2arrays(fields)
  res, err := self.connection.Exec(
    "INSERT INTO " + tab + " (" + strings.Join(*keys, ",") +
    ") VALUES (" + strings.Repeat("?,", len(*fields)-1) + "?);",
    *values...)
  if err != nil {
    return 0, err
  }
  return res.LastInsertId()
}

func (self *DBType) Upd_(tab string, id interface{}, fields *map[string]interface{}) (err error) {
  keys, values := map2arrays(fields)
  *values = append(*values, id)
  _, err = self.connection.Exec(
    "UPDATE INTO " + tab + " (" + strings.Join(*keys, ",") +
    ") VALUES (" + strings.Repeat("?,", len(*fields)-1) + "?) WHERE Id=?;",
    *values...)
  return err
}

func (self *DBType) Del_(tab string, ids []interface{}) (err error) {
  var query = strings.Repeat("DELETE FROM " + tab + " WHERE Id=?;", len(ids))
  _, err = self.connection.Exec(query, ids...)
  return err
}
