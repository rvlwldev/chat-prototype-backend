const MY_SQL = require("mysql2");

const DATABASE = {
	local: MY_SQL.createPool({
		host: "localhost",
		user: "root",
		password: "1234",
		database: "chat",
		waitForConnections: true,
		connectionLimit: 10,
	}),

	cupg: MY_SQL.createPool({
		host: "121.67.133.136",
		user: "ksy_local",
		password: "ksy123",
		database: "cupgdb",
		waitForConnections: true,
		connectionLimit: 10,
	}),

	execute: async (query, db) => {
		if (!db) db = "local";

		try {
			const [results, fields] = await DATABASE[db].promise().query(query);
			return true;
		} catch (error) {
			console.error("Error executing query:", error);
			throw false;
		}
	},

	select: async (query, db) => {
		if (!db) db = "local";

		const [rows] = await DATABASE[db].promise().query(query);
		return rows;
	},
};

module.exports = DATABASE;
