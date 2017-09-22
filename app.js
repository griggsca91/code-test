import Koa from 'koa';
import views from 'koa-views';
import json from 'koa-json';
import onerror from 'koa-onerror';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import dotenv from 'dotenv';

// routes
import index from './routes/index';
dotenv.config();
console.log(process.env);
console.log(process.env.DB_HOST);
const app = new Koa();

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  }),
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(`${__dirname}/public`));

app.use(
  views(`${__dirname}/views`, {
    extension: 'ejs',
  }),
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());

module.exports = app;
