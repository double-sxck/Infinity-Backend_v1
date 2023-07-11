const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const jwt = require("jsonwebtoken");
const db = require("../models/connection");
const jwtFilter = require("../middlewares/jwtFilter");

const configuration = new Configuration({
  apiKey: process.env.CHATGPT_API_KEY,
});

router.post("/", async (req, res) => {
  const { keywords } = req.body;
  const question = `${keywords} 이 키워드를 활용해서 소설을 써줘. 글자 수는 200자 내로 해줘. 작은 따옴표는 사용하지마.`;

  try {
    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    });

    return res.json(response.data.choices[0].message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "OpenAI Server Error" });
  }
});

router.post("/save", async (req, res) => {
  //생성 날짜, 작성자
  const { id, title, content, keywords } = req.body;
  let writer;
  try {
    const [author] = await db.query(
      `SELECT UserName FROM user WHERE UserId = ${id}`
    );
    writer = author;
  } catch (error) {
    console.error(error);
    return res.json({ error: "유저가 없음" });
  }

  try {
    const query = await db.query(
      `INSERT INTO Board(title, Content, UserName, created, views, keywords) VALUES('${title}', '${content}', '${writer[0].UserName}', DATE_ADD(NOW(), INTERVAL 9 HOUR), 0, '${keywords.keywords}')`
    );
    return res.json("success");
  } catch (error) {
    console.error(error);
    return res.json({ error: "sql 에러" });
  }
});

module.exports = router;
