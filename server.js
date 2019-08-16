const express     = require('express');
const app         = express();
const expressWs   = require('express-ws')(app);
const morgan      = require('morgan');
const compression = require('compression');
const serveStatic = require('serve-static');
const basicAuth   = require('basic-auth-connect');

const user = process.env.USER;
const pass = process.env.PASS;

let connects = [];

app.set('port', process.env.PORT || 3000);

if (user && pass) {
  app.use(basicAuth(user, pass));
}

app.use(morgan('dev'));
app.use(compression());
app.use(serveStatic(`${__dirname}/public`));

app.ws('/', (ws, req) => {
  console.log('connect', ws.upgradeReq.socket._peername);
//  console.log('***connect', ws);
//  console.log('***connect', ws.upgradeReq.ReadableState);
//  console.log('*****connect', ws.upgradeReq.IncomingMessage);
//  console.log('connect', ws.upgradeReq.IncomingMessage.headers.origin);
  connects.push(ws);

  ws.on('message', message => {
    console.log('reseceive', message, ws.upgradeReq.socket._peername);
    
    connects.forEach(socket => {
      console.log('send', socket.upgradeReq.socket._peername);
      socket.send(message);
    });
  });
  
  ws.on('close', () => {
    console.log('connection close', ws.upgradeReq.socket._peername);
//    console.log('connection close', ws);
    connects = connects.filter(conn => {
      return (conn === ws) ? false : true;
    });
  });
});

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'));
});
