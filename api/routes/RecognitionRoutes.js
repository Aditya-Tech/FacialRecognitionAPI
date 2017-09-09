'use strict';
module.exports = function(app) {
  var getData = require('../controllers/RecognitionController');

  // todoList Routes
  app.route('/register')
    .get(getData.returnNewUserOrNot);
    .post(getData.createNewUser);
};
