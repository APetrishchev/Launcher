package controller

func Init()) (err error) {
	fmt.Println("Database initialization")
	// fmt.Printf("Database \"%s\" connect as %s@%s:%d ... ", model.Db.Name, model.Db.User,
	// 	model.Db.Host, model.Db.Port)
	// fmt.Println(model.CheckError(model.Db.Open()))

	// model.Db.Begin()

	fmt.Println("\nCreate tables")
	fmt.Printf("  create \"networks\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("networks", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`Network` CHAR(15) NOT NULL UNIQUE",
		"`NetMask` INTEGER NOT NULL",
		"`Gateway` CHAR(15)",
		"`Name` VARCHAR(48) NOT NULL UNIQUE",
		"`Description` VARCHAR(1024)",
		"`Disable` INTEGER DEFAULT 0",
	}, "")))

	fmt.Printf("  create \"ips\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("ips", []string{
		"`Ip` CHAR(15) PRIMARY KEY UNIQUE",
		"`NetId` INTEGER NOT NULL",
		"`HostId` CHAR(256)",
		"`LastChangeTime` INTEGER",
		"`LastCheckTime` INTEGER",
		"`Description` VARCHAR(1024)",
		"`Availability` INTEGER",
		"`Disable` INTEGER DEFAULT 0",
	}, "")))

	fmt.Printf("  create \"hosts\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("hosts", []string{
		"`Id` CHAR(256) PRIMARY KEY UNIQUE",
		"`Name` VARCHAR(40)",
		"`DisplayedName` VARCHAR(40)",
		"`Mode` VARCHAR(20)", // {Prod | Test | Prep | Out | Conservate}
	}, "")))

	fmt.Printf("  create \"hostGroup\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("hostGroup", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`Name` VARCHAR(40)",
		"`Description` VARCHAR(1024)",
	}, "")))

	fmt.Printf("  create \"host_group\" ... ")
	fmt.Println(model.CheckError(model.Db.CreateTable("hostGroup", []string{
		"`GroupId` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`HostId` CHAR(256)",
	}, "")))

}