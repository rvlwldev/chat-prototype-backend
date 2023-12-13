const DATABASE = require("../Database");

const userQuery = {
	insert: async (id, username, profileUserImageUrl = null, role = 1, pw, DB = "local") => {
		const QUERY = `
            INSERT INTO USER (
                id, 
                username, 
                profileUserImageUrl,
                role,
                temp_pw
            ) VALUES ( ?, ?, ?, ?, ?)
        `;

		const values = [id, username, profileUserImageUrl, role, pw];

		return await DATABASE.execute(QUERY, values, DB);
	},

	selectFromIntranet: async (id, DB = "cug") => {
		const QUERY = `
            SELECT jumin_log as id,
                   name,
                   admin_check
              FROM cug_man
             WHERE jumin_log ='${id}'
        `;

		return await DATABASE.select(QUERY, DB);
	},

	selectByUserId: async (id, DB = "local") => {
		const QUERY = `
            SELECT id AS id,
                   username AS name,
                   profileUserImageUrl,
                   temp_pw
              FROM USER
             WHERE ID = '${id}'
        `;

		return await DATABASE.select(QUERY, DB);
	},

	searchByName: async (userId, text, DB = "local") => {
		const QUERY = `
            SELECT id,
                   username
              FROM USER
			 WHERE id != '${userId}'
               AND username like '%${text}%'
        `;

		return await DATABASE.select(QUERY, DB);
	},
};

module.exports = userQuery;
