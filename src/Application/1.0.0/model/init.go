package model

func (self *DBType) Init(initFilePath string) {
	self.Log.Write.Println()
	self.Log.Header.Println("Server must by stopped")
	self.Open()

	self.Begin()
  self.CreateTable("cron", []string{
		"  `id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"  `disabled` INTEGER DEFAULT 0",
		"  `type_` CHAR(12)",
		"  `name` VARCHAR(48) NOT NULL",
		"  `descr` VARCHAR(256)",
		"  `start` CHAR(16)",
		"  `months` INTEGER",
		"  `monthDays` INTEGER",
		"  `weekDays` INTEGER",
		"  `hours` INTEGER",
		"  `minutes` CHAR(24)",
		"  `stop` CHAR(16)",
		"  `last` CHAR(16)",
		"  `state` INTEGER DEFAULT 0",
		"  `next` CHAR(16)",
		"  `duration` INTEGER DEFAULT 0",
		"  `action` VARCHAR(64)",
		"  `cmdParams` VARCHAR(256)",
	}, "")
  self.CreateTable("appGroups", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`ParentId` INTEGER DEFAULT 0",
		"`ProfileId` INTEGER NOT NULL",
		"`Name` VARCHAR(48) NOT NULL",
		"`Pic` VARCHAR(256) DEFAULT NULL",
		"`Prompt` VARCHAR(256)",
		"`Descr` VARCHAR(1024)",
  }, "UNIQUE(ProfileId, Name)")
  self.CreateTable("applications", []string{
		"`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
		"`Name` VARCHAR(32) NOT NULL",
		"`Version` CHAR(26) NOT NULL",
		"`CallName` VARCHAR(64) NOT NULL",
		"`Pic` VARCHAR(256)",
		"`MenuPic` VARCHAR(256)",
		"`Groups` VARCHAR(512)",
		"`Langs` VARCHAR(256)",
		"`Styles` VARCHAR(256)",
		"`LastUseTime` CHAR(26) DEFAULT ''",
		"`SubsCounter` INTEGER",
		"`CommonRating` DECIMAL(3,2)",
		"`DesignRating` DECIMAL(3,2)",
		"`UsabilityRating` DECIMAL(3,2)",
		"`FunctionalityRating` DECIMAL(3,2)",
		"`VoteCounter` INTEGER",
		"`CommentsBranchId` INTEGER",
		//"`License`" // Одна из лицензий поддерживаемых сервис-провайдером.
		//"`Price`" // Цена аренды приложения. Электронный счет находится в разделе 'Об авторе'.
	}, "")
  self.CreateTable("sessions", []string{
    "`Id` CHAR(36) PRIMARY KEY UNIQUE",
    "`ProfileId` INTEGER",
    "`CreateTime` CHAR(26) NOT NULL",
    "`Closed` TINYINT(1) DEFAULT 0",
    "`ClientIp` VARCHAR(15) NOT NULL",
    "`Agent` VARCHAR(512) NOT NULL",
    "`LastActTime` CHAR(26) DEFAULT ''",
  }, "")
  self.CreateTable("accounts", []string{
    "`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
    "`Login` VARCHAR(48) UNIQUE NOT NULL",
    "`Passwd` VARCHAR(48) NOT NULL",
    "`Langs` VARCHAR(256)", // Языковые пакеты (через запятую в порядке предпочтения)
    "`PublicKey` VARCHAR(1536)",
    "`SecretKey` VARCHAR(1536)",
  }, "")
  self.CreateTable("profiles", []string{
    "`Id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
    "`AccountId` INTEGER NOT NULL",
    "`OwnerId` INTEGER NOT NULL",
    "`NickName` VARCHAR(64) NOT NULL",
    "`FirstName` VARCHAR(64)",
    "`LastName` VARCHAR(64)",
    "`ShortDescr` VARCHAR(256)",
    "`Descr` VARCHAR(1024)",
    "`Sex` TINYINT(1) DEFAULT 2",
    "`Birthday` DATE",
    "`Pic` VARCHAR(256)",
    "`HomeFolderId` INTEGER(14)",
    "`DocumentsFolderId` INTEGER(14)",
    "`PicturesFolderId` INTEGER(14)",
    "`AudioFolderId` INTEGER(14)",
    "`VideoFolderId` INTEGER(14)",
  }, "")
  self.CreateTable("profile_application", []string{
    "`ProfileId` INTEGER NOT NULL",
    "`AppId` INTEGER NOT NULL",
    "`AppGroups` VARCHAR(512)",
    "`Alias` VARCHAR(32) NOT NULL",
    "`Lang` CHAR(5) DEFAULT NULL",
    "`Style` VARCHAR(128) DEFAULT NULL",
    "`Backends` VARCHAR(1280) DEFAULT NULL", // URL of Backend Hosts (через запятую)
  }, "")
	self.End()

	self.Restore(initFilePath)

	self.Close()
}
