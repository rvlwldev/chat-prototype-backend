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
