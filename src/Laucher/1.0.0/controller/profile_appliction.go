package controller

import (
	"Laucher/1.0.0/model"
	"strings"
)

type Profile_ApplicationType struct {
	ProfileId         int64
	ApplicationId     int64
	ApplicationName   string
	ApplicationGroups []string
	Lang              string
	Style             string
	BackendURLs       []string
}

func (self *Profile_ApplicationType) Get() *[]*Profile_ApplicationType {
	query := &model.QueryType{
		Table:  "profile_application",
		Fields: "ProfileId, ApplicationId, ApplicationName, ApplicationGroups, Lang, Style, BackendURLs",
	}
	if self.ProfileId != 0 {
		query.Where = "pa.ProfileId=?"
		query.Values = []interface{}{self.ProfileId}
		if self.ApplicationId != 0 {
			query.Where +=  " AND pa.ApplicationId=?"
			query.Values = append(query.Values, self.ApplicationId)
		}
	} else {panic("Profiles Applications.get parameters error")}
	rows := query.Get()
	var (
		groups string
		backendURLs string
	)
	profileApps := []*Profile_ApplicationType{}
	for rows.Next() {
		profileApp := &Profile_ApplicationType{}
		if err := rows.Scan(&profileApp.ApplicationId, &profileApp.ApplicationId, &profileApp.ApplicationName,
		&groups, &profileApp.Lang, &profileApp.Style, &backendURLs); err != nil {
			panic(err)
		}
		profileApp.ApplicationGroups = strings.Split(groups, ",")
		profileApp.BackendURLs = strings.Split(backendURLs, ",")
		profileApps = append(profileApps, profileApp)
	}
	return &profileApps
}

func (self *Profile_ApplicationType) Add() {
	query := &model.QueryType{
		Table:  "profile_application",
		Fields: "ProfileId, ApplicationId, ApplicationName, ApplicationGroups, Lang, Style, BackendURLs",
		Values: []interface{}{
			self.ProfileId,
			self.ApplicationId,
			self.ApplicationName,
			strings.Join(self.ApplicationGroups, ","),
			self.Lang,
			self.Style,
			strings.Join(self.BackendURLs, ","),
		},
	}
	query.Add()
}

func (self *Profile_ApplicationType) Update() {
	query := &model.QueryType{
		Table:  "profile_application",
		Fields: "ApplicationGroups, ApplicationName, Lang, Style, BackendURLs",
		Values: []interface{}{
			strings.Join(self.ApplicationGroups, ","),
			self.ApplicationName,
			self.Lang,
			self.Style,
			strings.Join(self.BackendURLs, ","),
			self.ProfileId,
			self.ApplicationId,
		},
		Where: "ProfileId=? AND ApplicationId=?",
	}
	query.Update()
}

func (self *Profile_ApplicationType) Delete() {
	query := &model.QueryType{
		Table: "profile_application",
		Values: []interface{}{
			self.ProfileId,
			self.ApplicationId,
		},
		Where: "ProfileId=? AND ApplicationId=?",
	}
	query.Delete()
}
