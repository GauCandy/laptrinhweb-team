const bcrypt = require('bcrypt'); // Hoặc bcryptjs nếu bạn dùng thư viện đó

const generateHash = async () => {
  const plainPassword = "123456"; // Đổi thành mật khẩu bạn muốn
  const saltRounds = 10;
  
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  
  console.log("=== MẬT KHẨU ĐÃ BĂM ===");
  console.log(hashedPassword);
  console.log("=======================");
};

generateHash();