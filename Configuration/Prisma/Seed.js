const prisma = require("../../Utils/Prisma");

const roleData = [
	{ code: 99, name: "전체관리자" },
	{ code: 9, name: "운영자" },
	{ code: 2, name: "일반사용자" },
	{ code: 1, name: "익명사용자" },
];

async function seed(initYn = false) {
	if (initYn) {
		console.log("기존 데이터 삭제중 ...");
		await prisma.role.deleteMany();
	}

	try {
		console.log("초기 데이터 저장중...");
		await prisma.role.createMany({ data: roleData });
	} catch (err) {}

	console.log("데이터 초기화 완료");
}

module.exports = initializeData = async (initYn) => await seed(initYn);
