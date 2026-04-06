const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Đang bắt đầu gieo hạt dữ liệu... ---');

    // Chuẩn bị mật khẩu Admin mặc định (phải băm nó ra mới bảo mật)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Sử dụng lệnh upsert: Nếu chưa có email này thì tạo mới, nếu có rồi thì cập nhật
    const admin = await prisma.user.upsert({
        where: { email: 'admin@shop.com' },
        update: {}, // Nếu có rồi thì không làm gì cả
        create: {
            email: 'admin@shop.com',
            password: hashedPassword,
            fullName: 'Giám Đốc Hệ Thống',
            role: 'ADMIN',
            authProvider: 'LOCAL'
        },
    });

    console.log('--- Đã tạo thành công tài khoản Admin tối cao: ---');
    console.log(admin);
}

main()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});