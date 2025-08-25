// A tiny, safe sanitizer that removes Mongo operator injection keys
// Works with Express 4/5 since we DO NOT reassign req.query; we mutate nested keys.

function deepSanitize(obj) {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];

    // Delete dangerous keys like $gt, $ne or dotted paths
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }

    // Recurse into objects/arrays
    if (val && typeof val === 'object') {
      deepSanitize(val);
    }
  }
}

module.exports = function sanitize() {
  return function (req, res, next) {
    try {
      deepSanitize(req.body);
      deepSanitize(req.params);
      deepSanitize(req.query);
      next();
    } catch (e) {
      next(e);
    }
  };
};
