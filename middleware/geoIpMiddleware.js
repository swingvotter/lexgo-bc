const geoip = require("geoip-lite");

function geoIpMiddleware(req, res, next) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;

  const geo = geoip.lookup(ip);
  req.detectedCountry = geo?.country || null;

  console.log("Detected country:", req.detectedCountry);
  console.log("Detected country:", req.ip);

  next(); // pass control to next middleware or route
}

module.exports = geoIpMiddleware;
