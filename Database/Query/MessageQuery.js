const DATABASE = require("../Database");

// NOTE : CONVERT_TZ(FROM_UNIXTIME(${createdAt} / 1000), 'UTC', 'Asia/Seoul')
// from UNIXTIME to Date Type

const messageQuery = {
	insert: async (message, DB = "local") => {
		const {
			id,
			parentMessageId = null,
			channelId,
			userId,
			text = null,
			type,
			filePath = null,
			fileName = null,
			fileSize = null,
			createdAt,
		} = message;

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
		) VALUES ( ?,?,?,?,?,?,?,?,?,? )
		ON DUPLICATE KEY UPDATE
			text = VALUES(text);  
    `;

		const values = [
			id,
			parentMessageId,
			channelId,
			userId,
			text,
			type,
			filePath,
			fileName,
			fileSize,
			createdAt,
		];

		return await DATABASE.execute(QUERY, values, DB);
	},

	insertAll: async (messages, db = "local") => {
		messages = messages.sort((a, b) => a.createdAt - b.createAt);
		const results = await Promise.all(
			messages.map((message) => messageQuery.insert(message, db))
		);

		return results;
	},

	select: async (channelId, limit, db = "local") => {
		const QUERY = `
			SELECT  M.id,
					M.parentMessageId,
					M.channelId,
					M.userId,
					U.username,
					U.profileUserImageUrl,
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
		ORDER BY M.createdAt DESC
		LIMIT ${limit}
		`;

		return await DATABASE.select(QUERY, db);
	},

	selectCount: async (channelId, db = "local") => {
		const QUERY = `
      SELECT COUNT(1) AS count
        FROM MESSAGE M 
       WHERE M.channelId = '${channelId}'
    `;

		let result = await DATABASE.select(QUERY, db);
		return result[0].count;
	},

	selectByIds: async (channelId, messageId, db = "local") => {
		const QUERY = `
      SELECT M.id,
             M.parentMessageId,
             M.channelId,
             M.userId,
             U.username,
             U.profileUserImageUrl,
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
         AND M.id = '${messageId}'
    `;

		return await DATABASE.select(QUERY, db);
	},

	selectByCreatedAt: async (channelId, lastCreatedAt, order = "oldest", limit, db = "local") => {
		let inequalitySign = order == "latest" ? ">" : "<";

		const QUERY = `
      SELECT M.id,
             M.parentMessageId,
             M.channelId,
             M.userId,
             U.username,
             U.profileUserImageUrl,
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
         AND M.createdAt ${inequalitySign} ${lastCreatedAt}
       ORDER BY M.createdAt DESC
       LIMIT ${limit}
    `;

		return await DATABASE.select(QUERY, db);
	},

	selectCountBeforeCreatedAt: async (channelId, lastCreatedAt, order, db = "local") => {
		let inequalitySign = order == "latest" ? ">" : "<";

		const QUERY = `
      SELECT COUNT(1) AS count
        FROM MESSAGE M
       WHERE M.channelId = '${channelId}'
         AND M.createdAt ${inequalitySign} ${lastCreatedAt}
    `;

		let result = await DATABASE.select(QUERY, db);

		return result[0].count;
	},

	searchByUserId: async (userId, text, DB = "local") => {
		const QUERY = `
			SELECT M.channelId,
				   M.id,
				   M.parentMessageId,
				   M.userId,
				   U.username,
				   M.text,
				   M.filePath,
				   M.fileName,
				   M.fileSize,
				   M.createdAt
			  FROM MESSAGE M
			 INNER 
			  JOIN USER_CHANNEL UC
			    ON M.channelId = UC.channelId
				AND UC.userId = '${userId}'
			   AND M.type = 'text'
			 INNER
			  JOIN USER U
			    ON UC.userId = U.id
			 WHERE M.text LIKE '%${text}%'
			 	OR M.fileName LIKE '%${text}%'
		`;

		return await DATABASE.select(QUERY, DB);
	},
};

module.exports = messageQuery;
