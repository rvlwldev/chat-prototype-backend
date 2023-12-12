const DATABASE = require("../Database");

const channelQuery = {
	insertChannel: async (ID, NAME, TYPE, DB = "local") => {
		const QUERY = `
            INSERT INTO CHANNEL (
                id, 
                name, 
                type
            ) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            type = VALUES(type);
        `;

		return await DATABASE.execute(QUERY, [ID, NAME, TYPE], DB);
	},

	insertUserChannels: async (channelId, userId, DB = "local") => {
		const QUERY = `
            INSERT INTO USER_CHANNEL (
                channelId,
                userId
            ) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            channelId = VALUES(channelId),
            userId = VALUES(userId);
        `;

		return await DATABASE.execute(QUERY, [channelId, userId], DB);
	},

	selectChannelById: async (channelId, DB = "local") => {
		const QUERY = `
            SELECT C.id
                  ,C.name
                  ,C.type
              FROM CHANNEL C
             WHERE C.id = '${channelId}'
        `;

		return await DATABASE.select(QUERY, DB);
	},

	selectChannelsByUserId: async (userId, DB = "local") => {
		const QUERY = `
            SELECT C.id
                  ,C.name
                  ,C.type
              FROM CHANNEL C
             INNER 
              JOIN USER_CHANNEL UC 
                ON C.id = UC.channelId
               AND UC.userId = '${userId}'
        `;

		return await DATABASE.select(QUERY, DB);
	},

	selectChannelsByType: async (type, DB = "local") => {
		const QUERY = `
            SELECT id,
                   name,
                   type
            FROM CHANNEL
            WHERE type = '${type}'
        `;

		return await DATABASE.select(QUERY, DB);
	},

	searchChannelsByUserId: async (userId, text, DB = "local") => {
		const QUERY = `
            SELECT C.id
                  ,C.name
              FROM USER_CHANNEL UC
             INNER 
              JOIN CHANNEL C
                ON UC.channelId = C.id
               AND UC.userId = '${userId}'
             WHERE C.name LIKE '%${text}%'
        `;

		return await DATABASE.select(QUERY, DB);
	},
};

module.exports = channelQuery;
