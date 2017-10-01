var express = require('express');
var admin_router = express.Router();
module.exports = admin_router;

var path = require('path');

//設問一覧ページ
admin_router.get('/', function(req, res, next) {
  res.render("admin");
});
