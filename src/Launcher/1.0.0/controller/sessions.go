package controller

import (
	"Launcher/1.0.0/model"
	"time"

	"github.com/google/uuid"
)

type SessionType struct {
	Id          string `json:"id"`
	UserId      int64 `json:"userId"`
	ProfileId   int64 `json:"profileId"`
	CreateTime  time.Time `json:"createTime"`
	Closed      int `json:"closed"`
	ClientIp    string `json:"clientIp"`
	ClientAgent string `json:"clientAgent"`
	LastActTime time.Time `json:"lastActTime"`
}

func (self *SessionType) Open(sid interface{}) (ok bool) {
	if sid != nil {
		self.Id = sid.(string)
		sessions := self.Get()
		ok = len(*sessions) > 0
		if ok {
			self.UserId = (*sessions)[0].UserId
			self.ProfileId = (*sessions)[0].ProfileId
		}
	} else {ok = false}
	return ok
}

func (self *SessionType) Get() *[]*SessionType {
	query := &model.QueryType{
		Table: "sessions",
		Fields: "Id, UserId, ProfileId, CreateTime, Closed, ClientIp, ClientAgent, LastActTime",
	}
	if self.Id != "" && self.ClientIp != "" && self.ClientAgent != "" {
		query.Where = "Id=? AND ClientIp=? AND ClientAgent=? AND Closed=?"
		query.Values = []interface{}{self.Id, self.ClientIp, self.ClientAgent, self.Closed}
	}	else {panic("Session Get parameters error")}
	rows := query.Get()
	sessions := []*SessionType{}
	for rows.Next() {
		ses := &SessionType{}
		var (
			err error
			// profileId int64
			createTime string
			lastActTime string
		)
		if err = rows.Scan(&ses.Id, &ses.UserId, &ses.ProfileId, &createTime, &ses.Closed,
			&ses.ClientIp, &ses.ClientAgent, &lastActTime); err != nil {panic(err)}
		if ses.CreateTime, err = time.Parse(time.RFC3339, createTime); err != nil {panic(err)}
		if ses.LastActTime, err = time.Parse(time.RFC3339, lastActTime); err != nil {panic(err)}
		sessions = append(sessions, ses)
	}
	rows.Close()
	return &sessions
}

func (self *SessionType) Add() {
	id, err := uuid.NewUUID()
	if err != nil {panic(err)}
	self.Id = id.String()
  query := &model.QueryType{
		Table: "sessions",
		Fields: "Id, UserId, ProfileId, CreateTime, ClientIp, ClientAgent, LastActTime",
		Values: []interface{}{
			self.Id,
			self.UserId,
			self.ProfileId,
			time.Now().Format(time.RFC3339),
			self.ClientIp,
			self.ClientAgent,
			time.Now().Format(time.RFC3339),
		},
	}
  query.Add()
}

func (self *SessionType) Update() {
  query := &model.QueryType{
		Table: "sessions",
		Fields: "UserId, ProfileId, LastActTime",
		Values: []interface{}{self.UserId, self.ProfileId, time.Now().Format(time.RFC3339)},
	}
	query.Update()
}

func (self *SessionType) Close() {
  query := &model.QueryType{
		Table: "sessions",
		Fields: "Closed",
		Values: []interface{}{1},
	}
	query.Update()
}
