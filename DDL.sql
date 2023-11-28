CREATE TABLE `CHANNEL` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `MESSAGE` (
  `id` varchar(50) NOT NULL,
  `parentMessageId`  varchar(50),
  `channelId` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `text` text ,
  `type` varchar(10) NOT NULL DEFAULT 'text',
  `filePath` text DEFAULT NULL,
  `fileName` text DEFAULT NULL,
  `fileSize` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `USER` (
  `id` varchar(50)  NOT NULL,
  `username` varchar(20)  NOT NULL,
  `profileUserImageUrl` text,
  `role` int default 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `USER_CHANNEL` (
  `userId` varchar(50) NOT NULL,
  `channelId` varchar(50) NOT NULL,
  PRIMARY KEY (`userId`, `channelId`),
  FOREIGN KEY (`userId`) REFERENCES `USER`(`id`),
  FOREIGN KEY (`channelId`) REFERENCES `CHANNEL`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `MESSAGE`
ADD CONSTRAINT `FK_CHANNEL_ID`
FOREIGN KEY (`channelId`)
REFERENCES `CHANNEL`(`id`);

ALTER TABLE `MESSAGE`
ADD CONSTRAINT `FK_USER_ID`
FOREIGN KEY (`userId`)
REFERENCES `USER`(`id`);

ALTER TABLE `MESSAGE`
ADD CONSTRAINT `FK_PARENT_MESSAGE_ID`
FOREIGN KEY (`parentMessageId`)
REFERENCES `MESSAGE`(`id`);

INSERT INTO chat.`USER` (id,username,profileUserImageUrl,`role`) VALUES
	 ('44c5a8a4384857c6','강수면','',1),
	 ('47e2beb243c5bb9c','김형준(전산)','',1),
	 ('admin01','관리자01',NULL,99),
	 ('admin02','관리자02',NULL,99),
	 ('admin03','관리자03',NULL,99),
	 ('admin04','관리자04',NULL,99),
	 ('admin05','관리자05',NULL,99),
	 ('admin06','관리자06',NULL,99),
	 ('admin07','관리자07',NULL,99),
	 ('admin08','관리자08',NULL,99);
INSERT INTO chat.`USER` (id,username,profileUserImageUrl,`role`) VALUES
	 ('admin09','관리자09',NULL,99),
	 ('admin10','관리자10',NULL,99);


 SELECT M.id,
             M.parentMessageId,
             M.channelId,
             M.userId,
             U.username
             U.profileUserImageUrl AS profileImageUrl,
             M.text,
             M.type,
             M.filePath,
             M.fileName,
             M.fileSize,
             M.createdAt
        FROM MESSAGE M
        LEFT
       OUTER
        JOIN USER U
          ON M.userId = U.id
