package controller

import (
	"Laucher/1.0.0/model"
	"strings"
)

type UserType struct {
	Id          int64
	Login       string
	Passwd 			string
	PublicKey   string
	SecretKey   string
	Countries   []string
	Langs       []string
}

func (self *UserType) Get() {
	query := &model.QueryType{
		Table:  "profiles",
		Fields: "Id, Login, Passwd, PublicKey, SecretKey, Countries, Langs",
	}
	if self.Id != 0 {
		query.Where = "Id=?"
		query.Values = append(query.Values, self.Id)
	} else if self.Login != "" {
		query.Where = "Login=?"
		query.Values = append(query.Values, self.Login)
	} else {
		panic("User get params error")
	}
	rows := query.Get()
	var (
		countries string
		langs string
	)
	for rows.Next() {
		err := rows.Scan(&self.Id, &self.Login, &self.Passwd, &self.PublicKey, &self.SecretKey,
			&countries, &langs)
		if err != nil {panic(err)}
		self.Countries = strings.Split(countries, ",")
		self.Langs = strings.Split(langs, ",")
	}
	rows.Close()
}

func (self *UserType) Add() {
	query := &model.QueryType{
		Table:  "users",
		Fields: "Login, Passwd, PublicKey, SecretKey, Countries, Langs",
		Values: []interface{}{
			self.Login,
			self.Passwd,
			self.PublicKey,
			self.SecretKey,
			strings.Join(self.Countries, ","),
			strings.Join(self.Langs, ","),
		},
	}
	self.Id = query.Add()
}

func (self *UserType) Update() {
	query := &model.QueryType{
		Table:  "users",
		Fields: "Passwd, PublicKey, SecretKey, Countries, Langs",
		Values: []interface{}{
			self.Passwd,
			self.PublicKey,
			self.SecretKey,
			strings.Join(self.Countries, ","),
			strings.Join(self.Langs, ","),
		},
	}
	query.Update()
}

func (self *UserType) Delete() {
}

func (self *UserType) Auth() {
}
