package controller

import (
	"Application/1.0.0/model"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type SessionType struct {
	Id          string
	ProfileId   int64
	CreateTime  time.Time
	Closed      int
	ClientIp    string
	ClientAgent string
	LastActTime time.Time
}

func (self *SessionType) Open() (ok bool) {
	ok = false
	var (
		err error
		select_ string
		where   string
		values  []interface{}
		rows *sql.Rows
		createTime string
		lastActTime string
	)
	if self.Id != "" && self.ClientIp != "" && self.ClientAgent != ""{
		select_ = "ProfileId,CreateTime,LastActTime"
		where = "Id=? AND ClientIp=? AND ClientAgent=? AND Closed=?"
		values = []interface{}{self.Id, self.ClientIp, self.ClientAgent, self.Closed}
		if rows, err = model.Db.Get_("sessions", select_, where, &values); err != nil {panic(err)}
		for rows.Next() {
			ok = true
			if err = rows.Scan(&self.ProfileId, &createTime, &lastActTime); err != nil {panic(err)}
			if self.CreateTime, err = time.Parse(time.RFC3339, createTime); err != nil {panic(err)}
			if self.LastActTime, err = time.Parse(time.RFC3339, lastActTime); err != nil {panic(err)}
		}
		rows.Close()
	}
	return ok
}

func (self *SessionType) Add() {
	id, err := uuid.NewUUID()
	if err != nil {panic(err)}
	self.Id = id.String()
	fields := &map[string]interface{} {
    "Id": self.Id,
    "ProfileId": self.ProfileId,
    "CreateTime": time.Now().Format(time.RFC3339),
    "ClientIp": self.ClientIp,
    "ClientAgent": self.ClientAgent,
    "LastActTime": time.Now().Format(time.RFC3339),
	}
	model.Db.Begin()
	model.Db.Add_("sessions", fields)
	model.Db.End()
}

func (self *SessionType) Close() {
	fields := &map[string]interface{} {"Closed": 1}
	model.Db.Upd_("sessions", self.Id, fields)
}
