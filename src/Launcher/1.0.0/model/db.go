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

type QueryType struct{
  Table string
  Fields string
  Values []interface{}
  Where string
}

func (self *QueryType) Get() (*sql.Rows) {
  query := fmt.Sprintf("SELECT %s FROM %s", self.Fields, self.Table)
  if self.Where != "" {
    query += fmt.Sprintf(" WHERE %s", self.Where) }
  rows, err := Db.conn.Query(query, self.Values...)
  if err != nil {panic(err)}
  return rows
}

func (self *QueryType) Add() int64 {
  res, err := Db.conn.Exec(
    fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s?);", self.Table, self.Fields,
      strings.Repeat("?,", len(strings.Split(self.Fields, ","))-1)),
    self.Values...)
  if err != nil {panic(err)}
  id, err := res.LastInsertId()
  if err != nil {panic(err)}
  return id
}

func (self *QueryType) Update() {
  _, err := Db.conn.Exec(
    fmt.Sprintf("UPDATE INTO %s (%s) VALUES (%s?) WHERE %s;", self.Table, self.Fields,
      strings.Repeat("?,", len(strings.Split(self.Fields, ","))-1), self.Where),
    self.Values...)
  if err != nil {panic(err)}
}

func (self *QueryType) Delete() {
  var err error
  query := fmt.Sprintf("DELETE FROM %s WHERE", self.Table)
  if len(self.Values) > 0 {
    _, err = Db.conn.Exec(fmt.Sprintf("%s Id IN (%s?);", query, strings.Repeat("?,", len(self.Values) - 1)),
      self.Values...)
  } else if self.Where != "" {
    _, err = Db.conn.Exec(fmt.Sprintf("%s %s;", query, self.Where), self.Values...)
  } else {
    panic("Query Delete error")
  }
  if err != nil {panic(err)}
}
