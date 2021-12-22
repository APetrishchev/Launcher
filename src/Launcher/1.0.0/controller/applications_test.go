package controller

import (
	"Launcher/1.0.0/model"
	"fmt"
	"strings"
	"testing"
)

var (
  app = &ApplicationType{
		Name: "Test",
		Version: "1.0.0",
		PrevVersion: "",
		Date: JsonDateType("2021-05-11"),
		Picture: "public/pictures/.applications/ApplicationManager/setup.png",
		Groups: strings.Split("General"),
		Langs: strings.Split("ru-RU"),
		Description: "TestApplication",
		Path: "AppTest/1.0.0",
		LastUseTime: JsonDateType("2021-05-11"),
	}
)

func Test_ApplicationAdd(t *testing.T) {
  if err := model.CheckError(app.Add()); err != "OK" {
		t.Error("Expected \"OK\", got ", err)
	}
}

func Test_ApplicationGet(t *testing.T) {
  // app := ApplicationType{Id: 3}
  app_ := ApplicationType{Name: "Test", Version: "1.0.0"}
	apps, err := app_.Get()
	if err != "OK" {
		t.Error("Expected \"OK\", got ", err)
	} else {
    if (*(*apps)[0]).Id != app.Id {
			t.Error(fmt.Sprintf("Expected \"%s\", got ", app.Id), (*(*apps)[0]).Id)
		}
	}
}

func Test_ApplicationUpd(t *testing.T) {
  *app.Name = "tseT"
  if err := model.CheckError(app.Upd()); err != "OK" {
		t.Error("Expected \"OK\", got ", err)
	}
}

func Test_ApplicationDel(t *testing.T) {
  if err := model.CheckError(app.Del()); err != "OK" {
		t.Error("Expected \"OK\", got ", err)
	}
}
