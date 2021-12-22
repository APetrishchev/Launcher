package controller

import "Launcher/1.0.0/model"

//==============================================================================
type WindowType struct {
  ProfileId int64 `json:"profileId"`
  ApplicationId int64 `json:"applicationId"`
  Name string `json:"name"`
  Json string `json:"json"`
}

func (self *WindowType) Get() (wins map[string]string) {
	query := &model.QueryType{
		Table: "windows",
		Fields: "Name, Json",
		Where:  "ProfileId=? AND ApplicationId=?",
		Values: []interface{}{self.ProfileId, self.ApplicationId},
	}
	rows_ := query.Get()
	wins = make(map[string]string)
	for rows_.Next() {
		win := WindowType{}
		if err := rows_.Scan(&win.Name, &win.Json); err != nil {
			panic(err)
		}
		wins[win.Name] = win.Json
	}
	return
}

func (self *WindowType) Add() {
	query := &model.QueryType{
		Table: "windows",
		Fields: "ProfileId, ApplicationId, Name, Json",
		Values: []interface{}{self.ProfileId, self.ApplicationId, self.Name, self.Json},
	}
	query.Add()
}

func (self *WindowType) Upgate() {
	query := &model.QueryType{
		Table: "windows",
		Fields: "Name, Json",
		Where:  "ProfileId=? AND ApplicationId=?",
		Values: []interface{}{self.Name, self.Json, self.ProfileId, self.ApplicationId},
	}
	query.Update()
}

func (self *WindowType) Delete() {
	query := &model.QueryType{
		Table: "windows",
		Where:  "ProfileId=? AND ApplicationId=?",
		Values: []interface{}{self.ProfileId, self.ApplicationId},
	}
	if self.Name != "" {
		query.Where += " AND Name=?"
		query.Values = append(query.Values, self.Name)
	}
	query.Delete()
}
