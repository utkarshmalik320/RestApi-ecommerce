module.exports.bootstrap = async function(done) {
  await require('./redis').configure(sails);
  done();
};
