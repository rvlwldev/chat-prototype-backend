const DATABASE = require("../Database");

const userQuery = {
	insert: async (USERINFO, DB = "local") => {
		const QUERY = `
            INSERT INTO USER (
                id, 
                username, 
                profileUserImageUrl
            ) VALUES (
                '${USERINFO.id}',
                '${USERINFO.username}',
                '${USERINFO.profileImageUrl}'
            )
            ON DUPLICATE KEY UPDATE ID = ID; 
        `;

		return await DATABASE.execute(QUERY, DB).then((res) => res);
	},

	selectByUserId: async (USER_ID, DB = "local") => {
		const QUERY = `
            SELECT jumin_log AS ID,
                   p_name    AS NAME
              FROM admin_post_sub   
             WHERE LENGTH(jumin_log) > 1
               AND jumin_log = '${USER_ID}'
        `;

		return await DATABASE.select(QUERY, DB).then((res) => res);
	},
};

module.exports = userQuery;
