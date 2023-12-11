const DATABASE = require("../Database");

const channelQuery = {
	selectChannelsByUserId: async (userId, DB = "local") => {
		const QUERY = `
            SELECT C.id
                  ,C.name
                  ,C.type
              FROM USER_CHANNEL UC
             INNER 
              JOIN CHANNEL C
                ON UC.channelId = C.id 
             WHERE UC.userId = '${userId}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},

	selectChannelById: async (channelId, DB = "local") => {
		const QUERY = `
            SELECT C.id
                  ,C.name
                  ,C.type
              FROM CHANNEL C
             WHERE C.id = '${channelId}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},

	selectChannelsByType: async (type, DB = "local") => {
		const QUERY = `
            SELECT id,
                   name,
                   type
            FROM CHANNEL
            WHERE type = '${type}'
            `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},

	selectSuperPublicChannels: async (DB = "local") => {
		const QUERY = `
            SELECT id,
                   name,
                   type
            FROM CHANNEL
            WHERE type = 'super_public'
            `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},

	countUserChannelsByType: async (userId, type, DB = "local") => {
		const QUERY = `
            SELECT COUNT(1) AS count
              FROM USER_CHANNEL UC
             INNER 
              JOIN CHANNEL C
                ON UC.CHANNELID = C.ID 
               AND C.TYPE= '${type}'
               AND UC.USERID = '${userId}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res[0]);
	},

	mergeChannel: async (ID, NAME, TYPE, DB = "local") => {
		const QUERY = `
            INSERT INTO CHANNEL (
                id,
                name,
                type
            )
            VALUES (
                ?,
                ?,
                ?
            )
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            type = VALUES(type);
        `;

		return await DATABASE.execute(QUERY, [ID, NAME, TYPE], DB).then((res) => res);
	},

	mergeUserChannels: async (channelId, userId, DB = "local") => {
		const QUERY = `
            INSERT INTO USER_CHANNEL (
                channelId,
                userId
            ) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            channelId = VALUES(channelId),
            userId = VALUES(userId);
        `;

		return await DATABASE.execute(QUERY, [channelId, userId], DB).then((res) => res);
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

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},
};

module.exports = channelQuery;
