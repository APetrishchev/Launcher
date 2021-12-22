package controller

import (
	"Launcher/1.0.0/model"
)

type AppGroupsType struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Picture     string `json:"picture"`
}

func (self *AppGroupsType) Get() map[string]*AppGroupsType {
	query := &model.QueryType{
		Table:  "appGroups",
		Fields: "Name, Description, Picture",
	}
	if self.Name != "" {
		query.Where = "Name=?"
		query.Values = []interface{}{ self.Name }
	}
	rows := query.Get()
  groups := make(map[string]*AppGroupsType)
	for rows.Next() {
		grp := &AppGroupsType{}
		err := rows.Scan(&grp.Name, &grp.Description, &grp.Picture)
		if err != nil {panic(err)}
		groups[grp.Name] = grp
	}
	rows.Close()
	return groups
}

func (self *AppGroupsType) Add() {
	query := &model.QueryType{
		Table:  "appGroups",
		Fields: "Name, Description, Picture",
		Values: []interface{}{
			self.Name,
			self.Description,
			self.Picture,
		},
	}
	query.Add()
}

func (self *AppGroupsType) Update() {
	query := &model.QueryType{
		Table:  "appGroups",
		Fields: "Description, Picture",
		Where: "Name=?",
		Values: []interface{}{
			self.Description,
			self.Picture,
			self.Name,
		},
	}
	query.Update()
}

func (self *AppGroupsType) Delete() {
	query := &model.QueryType{
		Table:  "appGroups",
		Where: "Name=?",
		Values: []interface{}{ self.Name },
	}
	query.Delete()
}
