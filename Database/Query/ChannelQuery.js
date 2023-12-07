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

	selectChannel: async (channelId, DB = "local") => {
		const QUERY = `
            SELECT C.id
                  ,C.name
                  ,C.type
              FROM CHANNEL C
             WHERE C.id = '${channelId}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},

	selectSuperPublicChannels: async (DB = "local") => {
		const QUERY = `
            SELECT id,
                   name,
                   type
            FROM CHANNEL
            WHERE type = 'SUPER_PUBLIC'
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
                userId,
                channelId
            )
            VALUES (
                ? ,
                ?
            )
            ON DUPLICATE KEY UPDATE
            userId = VALUES(userId),
            channelId = VALUES(channelId);
        `;

		return await DATABASE.execute(QUERY, [userId, channelId], DB).then((res) => res);
	},
};

module.exports = channelQuery;
