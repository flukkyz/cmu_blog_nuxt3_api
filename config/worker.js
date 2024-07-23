const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const db = require('../models');
const Image = db.Image;
// const Question = db.Question;
// const Answer = db.Answer;
const Op = db.Sequelize.Op;

const worker = () => {
  schedule.scheduleJob('15 15 3 * * 7', async () => {
    // At 03:15:15 AM, only on Sunday
    run();
  });
};

const run = async () => {
  try {
    await Image.update({ active: false }, { where: { active: true } });
    const images = await Image.findAll({
      where: { active: false },
    });
    if (images.length > 0) {
      for (const img of images) {
        const checkBlog = await Blog.findOne({
          where: {
            content: {
              [Op.like]: `%${img.filename}%`,
            },
          },
        });
        if (checkBlog) {
          await Image.update({ active: true }, { where: { id: img.id } });
        }
      }
      const imageNotActives = await Image.findAll({
        where: { active: false },
      });
      for (const img of imageNotActives) {
        const dir = `./static/uploads/upload/`;
        const file = path.join(dir, `${img.filename}`);
        fs.unlinkSync(file);
      }
      await Image.destroy({ where: { active: false } });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  worker,
  run,
};
