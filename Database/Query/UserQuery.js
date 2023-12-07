const DATABASE = require("../Database");

const userQuery = {
	insert: async (id, username, profileUserImageUrl, DB = "local") => {
		const QUERY = `
            INSERT INTO USER (
                id, 
                username, 
                profileUserImageUrl
            ) VALUES ( ?, ?, ? )
            ON DUPLICATE KEY UPDATE 
                username = ?,
                profileUserImageUrl = ?;
        `;

		const values = [id, username, profileUserImageUrl, username, profileUserImageUrl];

		return await DATABASE.execute(QUERY, values, DB).then((res) => res);
	},

	selectByUserId: async (USER_ID, DB = "local") => {
		const QUERY = `
            SELECT id AS id,
                   username AS name,
                   profileUserImageUrl	
              FROM USER   
             WHERE ID = '${USER_ID}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},
};

module.exports = userQuery;
