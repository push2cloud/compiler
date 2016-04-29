module.exports = (debugFn, cb) => {
  return (err, result) => {
    if (err) {
      debugFn('error', err);
    } else {
      debugFn('success', result);
    }
    return cb(err, result);
  };
};
