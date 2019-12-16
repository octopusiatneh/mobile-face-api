var multer = require('multer');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images');
  },
  filename: (req, file, cb) => {
    console.log(file);
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, 'image-' + Date.now() + '.' + filetype);
  }
});

var upload = multer({ storage: storage });
module.exports = app => {
  const service = require("../app/service");

  app.post("/detectAllFace", upload.single('image'), (req, res, next) => {
    if (!req.file) {
      res.status(500);
      return next(err);
    }
    service.detectAllFace(req, res)
  });
};
