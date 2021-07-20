package controller

import (
	"Application/1.0.0/model"
	"fmt"
	"strings"
)

func Init(initFilePath string) {
	fmt.Printf("\n%s\nDatabase initialization\n", strings.Repeat("*", 80))
  fmt.Printf("Database \"%s\" connect as %s@%s:%d ... ", model.DbInstance.Name, model.DbInstance.User,
		model.DbInstance.Host, model.DbInstance.Port)
	fmt.Println(model.CheckError(model.DbInstance.Open()))

	model.DbInstance.Begin()

	fmt.Printf("Create table \"appGroups\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("appGroups", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`ParentId` INTEGER DEFAULT 0",
		"`ProfileId` INTEGER NOT NULL",
		"`Name` VARCHAR(48) NOT NULL",
		"`Picture` VARCHAR(256) DEFAULT NULL",
		"`Prompt` VARCHAR(256)",
		"`Description` VARCHAR(1024)",
  }, "UNIQUE(ProfileId, Name)")))

  fmt.Printf("Create table \"applications\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("applications", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`Name` VARCHAR(32) NOT NULL",
		"`Version` CHAR(26) NOT NULL",
		"`ParentVersion` CHAR(26)",
		"`ReleaseDate` CHAR(10) NOT NULL",
		"`Picture` VARCHAR(256)",
		"`Groups` VARCHAR(512)",
		"`Langs` VARCHAR(256)",
		"`Description` VARCHAR(512)",
		// "`CallName` VARCHAR(64) NOT NULL",
		// "`Styles` VARCHAR(256)",
		"`Path` VARCHAR(256) NOT NULL",
		"`LastUseTime` CHAR(26) DEFAULT ''",
	}, "")))

  fmt.Printf("Create table \"application_data\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("application_data", []string{
		"`ApplicationId` INTEGER NOT NULL",
		"`AuthorName` VARCHAR(128)",
		"`AuthorEmail` VARCHAR(128)",
		"`SubsCounter` INTEGER DEFAULT 0",
		"`VoteCounter` INTEGER DEFAULT 0",
		"`CompositeRating` DECIMAL(3,2) DEFAULT 0",
		"`DesignRating` DECIMAL(3,2) DEFAULT 0",
		"`UsabilityRating` DECIMAL(3,2) DEFAULT 0",
		"`FunctionalityRating` DECIMAL(3,2) DEFAULT 0",
		"`PageURL` VARCHAR(256)",
		"`License` VARCHAR(256) DEFAULT ''", // Одна из лицензий поддерживаемых сервис-провайдером.
		"`Price` VARCHAR(32)",
		"`Wallet` VARCHAR(256)",
	}, "")))

  fmt.Printf("Create table \"sessions\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("sessions", []string{
    "`Id` CHAR(36) PRIMARY KEY UNIQUE",
    "`ProfileId` INTEGER",
    "`CreateTime` CHAR(26) NOT NULL",
    "`Closed` TINYINT(1) DEFAULT 0",
    "`ClientIp` VARCHAR(15) NOT NULL",
    "`Agent` VARCHAR(512) NOT NULL",
    "`LastActTime` CHAR(26) DEFAULT ''",
  }, "")))

  fmt.Printf("Create table \"accounts\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("accounts", []string{
    "`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
    "`Login` VARCHAR(48) UNIQUE NOT NULL",
    "`Passwd` VARCHAR(48) NOT NULL",
    "`Langs` VARCHAR(256)", // Языковые пакеты (через запятую в порядке предпочтения)
    "`PublicKey` VARCHAR(1536)",
    "`SecretKey` VARCHAR(1536)",
  }, "")))

  fmt.Printf("Create table \"profiles\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("profiles", []string{
    "`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
    "`AccountId` INTEGER NOT NULL",
    "`OwnerId` INTEGER NOT NULL",
    "`NickName` VARCHAR(64) NOT NULL",
    "`FirstName` VARCHAR(64)",
    "`LastName` VARCHAR(64)",
    "`ShortDescr` VARCHAR(256)",
    "`Description` VARCHAR(1024)",
    "`Gender` TINYINT(1) DEFAULT 2",
    "`Birthday` DATE",
    "`Picture` VARCHAR(256)",
    "`HomeFolderId` INTEGER(14)",
    "`DocumentsFolderId` INTEGER(14)",
    "`PicturesFolderId` INTEGER(14)",
    "`AudioFolderId` INTEGER(14)",
    "`VideoFolderId` INTEGER(14)",
  }, "")))

  fmt.Printf("Create table \"profile_application\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("profile_application", []string{
    "`ProfileId` INTEGER NOT NULL",
    "`ApplicationId` INTEGER NOT NULL",
    "`ApplicationGroups` VARCHAR(512)",
    "`Alias` VARCHAR(32) NOT NULL",
    "`Lang` CHAR(5) DEFAULT NULL",
    "`Style` VARCHAR(128) DEFAULT NULL",
    "`Backends` VARCHAR(1280) DEFAULT NULL", // URL of Backend Hosts (через запятую)
  }, "")))

	fmt.Printf("Create table \"cron\" ... ")
  fmt.Println(model.CheckError(model.DbInstance.CreateTable("cron", []string{
		"  `Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"  `Disabled` INTEGER DEFAULT 0",
		"  `Type_` CHAR(12)",
		"  `Name` VARCHAR(48) NOT NULL",
		"  `Descr` VARCHAR(256)",
		"  `Start` CHAR(16)",
		"  `Months` INTEGER",
		"  `MonthDays` INTEGER",
		"  `WeekDays` INTEGER",
		"  `Hours` INTEGER",
		"  `Minutes` CHAR(24)",
		"  `Stop` CHAR(16)",
		"  `Last` CHAR(16)",
		"  `State` INTEGER DEFAULT 0",
		"  `Next` CHAR(16)",
		"  `Duration` INTEGER DEFAULT 0",
		"  `Action` VARCHAR(64)",
		"  `CmdParams` VARCHAR(256)",
	}, "")))
	model.DbInstance.End()

	Restore(initFilePath)

	model.DbInstance.Close()
	fmt.Printf("Database close ... Ok")

}
