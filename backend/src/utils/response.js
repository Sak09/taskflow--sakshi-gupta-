'use strict';

const sendSuccess = (res, data, statusCode = 200, meta = null) => {
  const body = { data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
};

const sendError = (res, message, statusCode = 500, fields = null) => {
  const body = { error: message };
  if (fields) body.fields = fields;
  res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
