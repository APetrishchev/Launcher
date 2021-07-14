package controller

import (
	"Application/1.0.0/model"
	"fmt"
)

type ApplicationType struct {
  Name string
  Version string
  Date string
  Previous string
  Path string
  Picture string
  Groups string
  Author struct {
    Name string
    Email string
  }
  Description string
  Langs []string
  Site string
  LastUseTime string
  SubsCounter int64
  VoteCounter int64
  Rating struct {
		Composite int8
		Design int8
		Usability int8
		Functionality int8
	}
  License string
  Price struct {
		Value int32
		Valute string
		Wallet string
	}
}

func (self *ApplicationType) Get() (*[]ApplicationType, error) {
  var (
    apps *[]ApplicationType
    err error
  )
  return apps, err
}

func (self *ApplicationType) Add() error {
fmt.Println("<<<<<<<<<<<", self)
  model.DbInstance.Add_("application", self)
  var err error
  return err
}

func (self *ApplicationType) Upd() error {
  var err error
  return err
}

func (self *ApplicationType) Del() error {
  var err error
  return err
}
