module.exports = app => {
  const service = require("../app/service");

  app.post("/detectAllFace", service.detectAllFace);
};
