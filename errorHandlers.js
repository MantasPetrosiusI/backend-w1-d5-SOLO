export const badRequestHandler = (error, req, res, next) => {
  if (error.status === 400) {
    if (error.errorsList) {
      res.status(400).send({
        message: error.message,
        errorsList: error.errorsList.map((e) => e.msg),
      });
    } else {
      res.status(400).send({ message: error.message });
    }
  } else {
    next(error);
  }
};

export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const notfoundHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const genericErrorHandler = (err, req, res, next) => {
  console.log("ERROR:", err);
  res.status(500).send({
    success: false,
    message: "Wait till we fix it!",
  });
};
