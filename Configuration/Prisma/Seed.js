const prisma = require("../../Utils/Prisma");

const roleData = [
	{ code: 99, name: "전체관리자" },
	{ code: 9, name: "운영자" },
	{ code: 2, name: "일반사용자" },
	{ code: 1, name: "익명사용자" },
];

const serviceData = [{ id: "test-service", name: "테스트서비스" }];

const channelData = [
	{
		serviceId: "test-service",
		id: "test-channel-01",
		name: "테스트채널01",
		type: "public",
	},
];

const userChannelData = [
	{
		serviceId: "test-service",
		userId: "rlagudwns",
		channelId: "test-channel-01",
		readAt: new Date(),
	},
];

async function seed(initYn = false) {
	if (initYn) {
		console.log("기존 데이터 삭제중 ...");
		await prisma.$transaction([
			prisma.role.deleteMany(),
			prisma.userChannel.deleteMany(),
			prisma.channel.deleteMany(),
			prisma.service.deleteMany(),
		]);
	}

	try {
		console.log("초기 데이터 저장중...");
		await prisma.$transaction([
			prisma.role.createMany({ data: roleData }),
			prisma.service.createMany({ data: serviceData }),
			prisma.channel.createMany({ data: channelData }),
			prisma.userChannel.createMany({ data: userChannelData }),
		]);
	} catch (err) {
		if (err.code == "P2002") return;

		console.log("seeding ERROR");
		console.error(err);
	}

	console.log("데이터 확인 완료");
}

module.exports = initializeData = async (initYn) => await seed(initYn);
