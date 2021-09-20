package controller

import (
	"Laucher/1.0.0/model"
	"fmt"
)

func Init(initFilePath string) (err error) {
	fmt.Println("Database initialization")
	fmt.Printf("Database \"%s\" connect as %s@%s:%d ... ", model.Db.Name, model.Db.User,
		model.Db.Host, model.Db.Port)
	fmt.Println(model.CheckError(model.Db.Open()))

	model.Db.Begin()

	fmt.Println("\nCreate tables")
	fmt.Printf("  create \"appGroups\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("appGroups", []string{
		// "`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		// "`ParentId` INTEGER DEFAULT 0",
		// "`ProfileId` INTEGER NOT NULL",
		"`Name` VARCHAR(48) NOT NULL UNIQUE",
		// "`Prompt` VARCHAR(256)",
		"`Description` VARCHAR(1024)",
		"`Picture` VARCHAR(256) DEFAULT NULL",
	}, "")))
	// }, "UNIQUE(ProfileId, Name)")))

	fmt.Printf("  create \"applications\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("applications", []string{
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
		"`Styles` VARCHAR(256)",
		"`URL` VARCHAR(256) NOT NULL",
		"`LastUseTime` CHAR(26) DEFAULT ''",
	}, "")))

	fmt.Printf("  create \"application_data\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("application_data", []string{
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

	fmt.Printf("  create \"sessions\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("sessions", []string{
		"`Id` CHAR(36) PRIMARY KEY UNIQUE",
		"`UserId` INTEGER NOT NULL",
		"`ProfileId` INTEGER NOT NULL",
		"`CreateTime` CHAR(26) NOT NULL",
		"`Closed` TINYINT DEFAULT 0",
		"`ClientIp` VARCHAR(15) NOT NULL",
		"`ClientAgent` VARCHAR(512) NOT NULL",
		"`LastActTime` CHAR(26) DEFAULT ''",
	}, "")))

	fmt.Printf("  create \"users\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("users", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`Login` VARCHAR(48) UNIQUE NOT NULL",
		"`Passwd` VARCHAR(48) NOT NULL",
		"`PublicKey` VARCHAR(1536)",
		"`SecretKey` VARCHAR(1536)",
		"`Countries` VARCHAR(256) DEFAULT 'US'", // Страны проживания
		"`Langs` VARCHAR(256) DEFAULT 'en-US'",  // Языковые пакеты (через запятую в порядке предпочтения)
	}, "")))

	fmt.Printf("  create \"profiles\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("profiles", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`UserId` INTEGER NOT NULL",
		"`OwnerId` INTEGER NOT NULL",
		"`Name` VARCHAR(64) NOT NULL",
		"`FirstName` VARCHAR(64)",
		"`LastName` VARCHAR(64)",
		"`ShortDescr` VARCHAR(256)",
		"`Description` VARCHAR(1024)",
		"`Gender` CHAR(1) DEFAULT 'u'",
		"`Birthday` DATE",
		"`Picture` VARCHAR(256)",
		"`HomeFolder` VARCHAR(256) DEFAULT ''",
		"`DocumentsFolder` VARCHAR(256) DEFAULT ''",
		"`PicturesFolder` VARCHAR(256) DEFAULT ''",
		"`AudioFolder` VARCHAR(256) DEFAULT ''",
		"`VideoFolder` VARCHAR(256) DEFAULT ''",
		"`PreferredApplications` VARCHAR(1024)",
	}, "")))

	fmt.Printf("  create \"profile_application\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("profile_application", []string{
		"`ProfileId` INTEGER NOT NULL",
		"`ApplicationId` INTEGER NOT NULL",
		"`ApplicationName` VARCHAR(32)",
		"`ApplicationGroups` VARCHAR(512)",
		"`Lang` CHAR(5)",
		"`Style` VARCHAR(128) DEFAULT 'default'",
		"`BackendURLs` VARCHAR(1280)", // URL of Backend Hosts (через запятую)
	}, "")))

	fmt.Printf("  create \"windows\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("windows", []string{
		"`ProfileId` INTEGER NOT NULL",
		"`ApplicationId` INTEGER NOT NULL",
		"`Name` VARCHAR(40) NOT NULL",
		"`Json` VARCHAR(128)",
	}, "")))

	fmt.Printf("  create \"chronos\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("chronos", []string{
		"`Country` VAR(2) NOT NULL",
		"`Json` VARCHAR(2560)",
	}, "")))

	model.Db.End()

	Restore(initFilePath)

	model.Db.Close()
	fmt.Println("Database close ... Ok")

	return nil
}
