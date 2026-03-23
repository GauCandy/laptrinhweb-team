require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: http://localhost:${PORT}`);
});