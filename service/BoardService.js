const { Board, sequelize } = require("../models");
const fs = require("fs");
const { Op } = require("sequelize");
class BoardService {
  async showAllBoard() {
    try {
      const result = await Board.findAll();
      return result;
    } catch (err) {
      console.log(err);
      return 404;
    }
  }

  async showOneBoard(boardId) {
    try {
      await Board.increment("views", {
        by: 1,
        where: { boardId },
      });
      const result = await Board.findAll({ where: { boardId } });
      return result;
    } catch (err) {
      console.log(err);
      return 404;
    }
  }
  async InsertBoard(boardInfo) {
    try {
      const { title, novel, character, event, background, userName, image } =
        boardInfo;
      const tempImage = fs.readFileSync("public/images/temp/" + image);
      fs.rmdirSync("public/images/temp/", { recursive: true, force: true });
      if (!fs.existsSync("public/images/release")) fs.mkdirSync("public/images/release");
      fs.writeFileSync("public/images/release/" + image, tempImage);
      const imageLocation = "/image/release/" + image;
      const result = await Board.create({
        title,
        novel,
        character,
        event,
        background,
        userName,
        image: imageLocation,
        created: sequelize.literal("NOW()"),
        views: 0,
        likes: 0,
      });
      return 200;
    } catch (err) {
      console.log(err);
      return 500;
    }
  }

  async searchBoard(title) {
    try {
      const result = await Board.findAll({
        where: {
          title: {
            [Op.like]: `%${title}%`,
          },
        },
      });
      return result;
    } catch (err) {
      console.log(err);
      return 404;
    }
  }
  async modifyBoard(boardId, userName, boardInfo) {
    try {
      const [updatedCount] = await Board.update(boardInfo, {
        where: { boardId, userName },
      });
      if (updatedCount === 1) {
        return 200;
      }
      return 404;
    } catch (err) {
      console.log(err);
      return 500;
    }
  }

  async deleteBoard(boardId, userName) {
    try {
      await Board.destroy({
        where: {
          boardId,
          userName,
        },
      });
      return 200;
    } catch (err) {
      console.log(err);
      return 500;
    }
  }
}

module.exports = BoardService;
