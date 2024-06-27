export const error = (
  res,
  error,
  code,
) => {
  return res.status(code).json({
    status: 'error',
    code: code,
    message: error.message,
  });
};

export const success = (
  res,
  message,
  code,
  data,
) => {
  return res.status(code).json({
    status: 'success',
    message,
    code,
    data,
  });
};
