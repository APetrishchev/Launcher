package controller

import (
	"Laucher/1.0.0/model"
	"strings"
)

type UserType struct {
	Id          int64 `json:"id"`
	Login       string `json:"login"`
	Passwd 			string `json:"passwd"`
	PublicKey   string `json:"publicKey"`
	SecretKey   string `json:"secretKey"`
	Countries   []string `json:"countries"`
	Langs       []string `json:"langs"`
}

func (self *UserType) Get() *UserType {
	query := &model.QueryType{
		Table:  "users",
		Fields: "Id, Login, Passwd, PublicKey, SecretKey, Countries, Langs",
	}
	if self.Id != 0 {
		query.Where = "Id=?"
		query.Values = append(query.Values, self.Id)
	} else if self.Login != "" {
		query.Where = "Login=?"
		query.Values = append(query.Values, self.Login)
		if self.Passwd != "" {
			query.Where += " AND Passwd=?"
			query.Values = append(query.Values, self.Passwd)
		}
	} else {
		panic("User.Get params error") }
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
	return self
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
