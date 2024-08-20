// index.js
const express = require("express");
const cors = require("cors");

const app = express();

// CORS 미들웨어 적용
app.use(cors());

// 간단한 API 엔드포인트 설정
app.get("/api/data", (req, res) => {
  res.json({ message: "CORS 문제가 해결되었습니다!" });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
