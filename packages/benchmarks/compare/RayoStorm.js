const rayo = require('rayo');

const app = rayo({ port: 5050, storm: { monitor: false } });
const handler = (req, res) => {
  res.end(`Thunderstruck... ${req.params.alias}`);
};

app.get('/users/:alias', handler).start();
