const express = require("express");
const router = express.Router();
const path = require("path");

// router.get("/", (req, res) => {
//   res.status(200).render(path.join(__dirname, "../views/apps.ejs"));
// });

router.get("/pdfhive/privacy", (req, res) => {
  try {
    res
      .status(200)
      .render(path.join(__dirname, `../views/apps/pdfhive/privacy.ejs`));
  } catch (error) {
    res.status(404).render(path.join(__dirname, `../views/error.ejs`));
  }
});

router.get("/pdfhive/terms", (req, res) => {
  try {
    res
      .status(200)
      .render(path.join(__dirname, `../views/apps/pdfhive/terms.ejs`));
  } catch (error) {
    res.status(404).render(path.join(__dirname, `../views/error.ejs`));
  }
});



module.exports = router;
