const express = require("express");
const UserService = require("../service/userService");
const asyncify = require("express-asyncify").default;
const router = asyncify(express.Router());

const userService = new UserService();

router.post("/register", async (req, res) => {
  const userDTO = req.body;
  const User = await userService.register(userDTO);

  res.sendStatus(User);
});

router.post("/login", async (req, res) => {
  const userDTO = req.body;
  const login = await userService.login(userDTO);
  const { userUniqueId, userId, userName } = login;
  if (!login) return res.sendStatus(401);
  req.session.loginData = {
    userUniqueId,
    userId,
    userName,
  };
  req.session.save();

  res.status(200).send(req.session.loginData);
});

router.get("/logincheck", async (req, res) => {
  const { loginData } = req.session;
  if (!loginData) return res.status(404).send({ login: false });

  return res.status(200).send({ login: true, loginData });
});

router.get("/logout", async (req, res) => {
  req.session.destroy();
  return res.sendStatus(200);
});
module.exports = router;
