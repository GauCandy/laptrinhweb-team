const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Khởi tạo máy khách kết nối với Google
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:6060/api/auth/google/callback'
)

// Hàm tạo đường link dẫn khách sang nhà Google
const getGoogleAuthUrl = () => {
    return googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 
                'https://www.googleapis.com/auth/userinfo.email'
            ]});
};

//Hàm xử lý dữ liệu sau khi khách từ Google trở về
const loginWithGoogle = async (code) => {
  // Mang cái mã (code) đi đổi lấy Token của Google
  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens);

  //  Lấy thông tin cá nhân của khách từ Google
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  
  const email = payload.email;
  const fullName = payload.name;
  const googleId = payload.sub; // sub chính là ID duy nhất của Google
  const avatarUrl = payload.picture;

  // Kiểm tra xem khách này đã có trong MySQL chưa
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Nếu là khách mới tinh, tự động tạo tài khoản luôn (không cần password)
    user = await prisma.user.create({
      data: {
        email,
        fullName,
        avatarUrl,
        googleId,
        authProvider: 'GOOGLE' // Đánh dấu là nick tạo từ Google
      }
    });
  } else if (!user.googleId) {
    // Trải nghiệm người dùng tinh tế: Khách đã từng đăng ký bằng email/pass thủ công, 
    // nay lười nên bấm nút Google. Ta sẽ tự động móc nối tài khoản Google vào nick cũ cho họ!
    user = await prisma.user.update({
      where: { email },
      data: { googleId, authProvider: 'GOOGLE', avatarUrl }
    });
  }

  // 4. Tạo thẻ từ JWT của riêng hệ thống chúng ta và giao cho khách
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};



// Hàm xử lý nghiệm vụ đăng ký tài khoản
const registerUser = async (email, password, fullName) => {
    // Kiểm tra xem email này đã ai dùng chưa 
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
     // Nếu có rồi thì ném ra một lỗi, lát nữa Controller sẽ chụp cái lỗi này để báo cho người dùng
       throw new Error('Email này đã được đăng ký');
    }

    // Bước 2: Băm (Hash) mật khẩu bảo mật
   // Sinh ra 10 vòng xáo trộn (salt). Mức 10 là tiêu chuẩn vàng: đủ khó để hacker không giải mã được, nhưng đủ nhanh để server không bị lag.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Bước 3: Lưu user mới vào postgreSQL
  const newUser = await prisma.user.create({
    data: {
        email,
        password: hashedPassword,
        fullName
    // role và authProvider không cần truyền vì Prisma sẽ tự lấy giá trị @default trong schema
    },
    // Chỉ select những trường cần thiết để trả về, TUYỆT ĐỐI giấu trường password đi
    select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
    }
  });

  // Trả về thông tin user (đã che giấu pass) cho Controller
  return newUser;
};

const loginUser = async (email, password) => {
    // Tìm user trong Database theo email
    const user = await prisma.user.findUnique({
        where: { email }
    });
    console.log("1. User tìm thấy trong DB:", user ? "CÓ" : "KHÔNG");

    // Nếu không tìm thấy user, báo lỗi mập mờ để tránh bị hacker dò email
    if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    console.log("2. Kết quả so sánh Pass:", isPasswordMatch);

    if ( !isPasswordMatch) {
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // Đúng pass rồi! Sản xuất thẻ từ (Token)
  // Gói ID và Role của khách vào trong thẻ để sau này phân quyền (Admin/Customer)
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Giấu password đi trước khi trả thông tin về cho khách
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

module.exports = {
    registerUser,
    loginUser,
    loginWithGoogle,
    getGoogleAuthUrl
  };