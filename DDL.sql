-- chat.CHANNEL definition

CREATE TABLE `CHANNEL` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '채널 ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '채널명',
  `type` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '채널타입',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- chat.MESSAGE definition

CREATE TABLE `MESSAGE` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'ID',
  `parentMessageId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '부모 ID',
  `channelId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '채널 ID',
  `userId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '유저 ID',
  `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '메세지 텍스트',
  `type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'text' COMMENT '메세지 타입',
  `filePath` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '첨부파일 경로',
  `fileName` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '첨부파일 이름',
  `fileSize` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '첨부파일 크기',
  `createdAt` bigint NOT NULL COMMENT '생성일자',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- chat.`USER` definition

CREATE TABLE `USER` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '유저 ID',
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '유저명',
  `profileUserImageUrl` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '프로필사진 경로',
  `role` int DEFAULT '1' COMMENT '권한',
  `temp_pw` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- chat.USER_CHANNEL definition

CREATE TABLE `USER_CHANNEL` (
  `userId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '유저 ID',
  `channelId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '채널 ID',
  PRIMARY KEY (`userId`,`channelId`),
  KEY `channelId` (`channelId`),
  CONSTRAINT `USER_CHANNEL_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `USER` (`id`),
  CONSTRAINT `USER_CHANNEL_ibfk_2` FOREIGN KEY (`channelId`) REFERENCES `CHANNEL` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;