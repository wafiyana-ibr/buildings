const formDataWafi = require('express-form-data');
const osWafi = require('os');

const formDataOptionsWafi = {
    uploadDir: osWafi.tmpdir(),
    autoClean: true,
};

module.exports = { formDataWafi, formDataOptionsWafi };
