const DATABASE = require("../Database");

// NOTE : CONVERT_TZ(FROM_UNIXTIME(${createdAt} / 1000), 'UTC', 'Asia/Seoul')
// from UNIXTIME to Date Type

const messageQuery = {
	insert: async (message, DB = "local") => {
		const channelId = message.channelId;
		const messageId = message.id;
		const parentMessageId = `${message.parentMessageId}` || null;
		const userId = message.userId;

		const text = message.text;
		const type = message.data?.type ? `${message.data.type}` : `text`;
		const fileName = message.data?.fileName ? `${message.data.fileName}` : null;
		const fileSize = message.data?.fileSize ? `${message.data.fileSize}` : null;
		const filePath = message.data?.filePath ? `${message.data.filePath}` : null;

		const createdAt = message.createdAt;

		const QUERY = `
      INSERT INTO MESSAGE (
        id,
        parentMessageId,
        channelId,
        userId,
        text,
        type,
        filePath,
        fileName,
        fileSize,
        createdAt
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
      ON DUPLICATE KEY UPDATE
      text = VALUES(text);
          
    `;

		const values = [
			messageId,
			parentMessageId,
			channelId,
			userId,
			message.text,
			type,
			filePath,
			fileName,
			fileSize,
			createdAt,
		];

		return DATABASE.execute(QUERY, values, DB);
	},

	insertAll: async (messages, db = "local") => {
		messages = messages.sort((a, b) => a.createdAt - b.createAt);
		const results = await Promise.all(
			messages.map((message) => messageQuery.insert(message, db))
		);

		return results;
	},

	select: async (channelId, db = "local") => {
		const QUERY = `
      SELECT M.id,
             M.parentMessageId,
             M.channelId,
             M.userId,
             U.username,
             U.profileUserImageUrl AS profileImageUrl,
             M.text,
             M.type,
             M.filePath,
             M.fileName,
             M.fileSize,
             M.createdAt,
             CONVERT_TZ(FROM_UNIXTIME(M.createdAt / 1000), 'UTC', 'Asia/Seoul') AS test
        FROM MESSAGE M
        LEFT
       OUTER
        JOIN USER U
          ON M.userId = U.id
       WHERE M.channelId = '${channelId}'
       ORDER BY M.createdAt DESC
    `;

		return await DATABASE.select(QUERY, db);
	},

	selectById: async (channelId, id, db = "local") => {
		const QUERY = `
      SELECT M.id,
             M.parentMessageId,
             M.channelId,
             M.userId,
             U.username,
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
       WHERE M.channelId = '${channelId}'
         AND M.id = '${id}'
       ORDER BY M.createdAt DESC
    `;

		return await DATABASE.select(QUERY, db);
	},

	selectAfterCreatedAt: async (channelId, lastCreatedAt, db = "local") => {
		const QUERY = `
      SELECT M.id,
             M.parentMessageId,
             M.channelId,
             M.userId,
             U.username,
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
       WHERE M.channelId = '${channelId}'
         AND M.createdAt > ${lastCreatedAt}
       ORDER BY M.createdAt DESC
    `;

		return await DATABASE.select(QUERY, db);
	},
};

module.exports = messageQuery;
