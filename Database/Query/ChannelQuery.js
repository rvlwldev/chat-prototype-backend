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

	selectPublicChannels: async (DB = "local") => {
		const QUERY = `
            SELECT id,
                   name,
                   type
            FROM CHANNEL
            WHERE type = 'super_public'
            `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},

	countAllPublicChannelsWithUserId: async (userId, DB = "local") => {
		const QUERY = `
            SELECT COUNT(1) AS count
              FROM USER_CHANNEL UC
             INNER 
              JOIN CHANNEL C
                ON UC.CHANNELID = C.ID 
               AND C.TYPE= 'SUPER_PUBLIC'
               AND UC.USERID = '${userId}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res[0]);
	},

	mergeUserChannels: async (ID, NAME, TYPE, USER_ID, DB = "local") => {
		const CHANNEL_INSERT_QUERY = `
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

		const USER_CHANNEL_MERGE_QUERY = `
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

		const channelInsertResult = await DATABASE.execute(
			CHANNEL_INSERT_QUERY,
			[ID, NAME, TYPE],
			DB
		).then((res) => res);

		const userChannelMergeResult = await DATABASE.execute(
			USER_CHANNEL_MERGE_QUERY,
			[USER_ID, ID],
			DB
		).then((res) => res);

		return channelInsertResult && userChannelMergeResult;
	},
};

module.exports = channelQuery;
