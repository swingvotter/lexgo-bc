const geoip = require("geoip-lite");

function geoIpMiddleware(req, res, next) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;

    const geo = geoip.lookup(ip);
    req.detectedCountry = geo?.country || null;



    next(); // pass control to next middleware or route
  } catch (error) {
    console.error("Error in geoIpMiddleware:", error);
    req.detectedCountry = null;
    next(); // continue even if there's an error
  }
}

module.exports = geoIpMiddleware;
