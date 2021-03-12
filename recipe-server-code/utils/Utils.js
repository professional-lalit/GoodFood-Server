const { validationResult } = require('express-validator/check');

const isValid = (req, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
        return false;
    }
    return true;
}

exports.isValid = isValid;



