
const validateData = (schema, type) => async (req, res, next) => {
  try {
    const getType = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    };
    const options = { language: { key: '{{key}} ' } };
    const data = getType[type];
    const isValid = await schema.validate(data, options);
    if (!isValid.error) {
      return next();
    }
    const { message } = isValid.error.details[0];
    return res.status(422).json({
      status: 'error',
      message,
      code: 422,
    });
  } catch (error) {
    return next(error);
  }
};

export default validateData;
