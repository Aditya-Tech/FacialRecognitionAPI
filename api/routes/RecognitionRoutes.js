'use strict';
module.exports = function(app) {
  var getData = require('../controllers/RecognitionController');
  app.route('/register')
    .get(getData.returnNewUserOrNot);
    .post(getData.createNewUser);
  
  app.route('/recognize')
    .get(getData.returnIdentity);
};
