const prisma = require("../../Utils/Prisma");

const roleData = [
	{ code: 1, name: "익명사용자" },
	{ code: 2, name: "일반사용자" },
	{ code: 9, name: "운영자" },
	{ code: 99, name: "전체관리자" },
];

const channelTypeData = [
	{ code: 10, name: "private" },
	{ code: 50, name: "public" },
];

const messageTypeData = [
	{ code: 10, name: "text" },
	{ code: 11, name: "image" },
	{ code: 12, name: "audio" },
	{ code: 13, name: "video" },
	{ code: 14, name: "file" },
	{ code: 15, name: "vote" },

	{ code: 20, name: "notice-created" },
	{ code: 21, name: "notice-joined" },
	{ code: 22, name: "notice-left" },
];

const serviceData = [
	{ id: "test-service01", name: "테스트서비스01" },
	{ id: "test-service02", name: "테스트서비스02" },
	{ id: "test-service03", name: "테스트서비스03" },
];

const channelData = [
	{
		serviceId: "test-service01",
		id: "test-channel01",
		name: "테스트공개채널01",
		typeCode: 50,
	},
	{
		serviceId: "test-service01",
		id: "test-channel02",
		name: "테스트공개채널02",
		typeCode: 50,
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
			prisma.channelType.createMany({ data: channelTypeData }),
			prisma.messageType.createMany({ data: messageTypeData }),
			prisma.service.createMany({ data: serviceData }),
			prisma.channel.createMany({ data: channelData }),
		]);
	} catch (err) {
		if (err.code == "P2002") return;

		console.log("seeding ERROR");
		console.error(err);
	}

	console.log("데이터 확인 완료");
}

module.exports = initializeData = async (initYn) => await seed(initYn);
