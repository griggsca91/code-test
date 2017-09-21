import Router from 'koa-router';
import CryptoJS from 'crypto-js';
import http from 'https';

const router = new Router(); // require('koa-router')()
const accountId = "706505873793485629";
const apiSettings = "1645412287691666032";
const apiKey = "4UQadjX14fasZR0f/VTKLGfM1VMV9oaOIcK5bLppG93o8ICp4Fx4p2G6lvY2ztqrwP9R7lenJ5MWyJIGCvHicg==";
const auth = accountId + ':' + apiSettings + ':' + (new Date()).getTime();
const authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);


let getRequestURL = (requestType, parameters) => {
  let url = "https://api.boldchat.com/aid/" + accountId + "/data/rest/json/v1/" + requestType + "?auth=" + authHash + (parameters.length > 0 ? ("&" + parameters) : "");
  return url
}

let getNumberOfMobileViewers = () => {
  const requestType = "getActiveVisits";
  const parameters = "FolderID=699623076574954132";

  const location = getRequestURL(requestType, parameters);
  return new Promise(resolve => {
    http.get(location, (res) => {
      let data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        let par = JSON.parse(data);
        let number = par.Data.reduce((prev, cur) => {
          return prev + (cur.UserAgent.includes("Mobile") ? 1 : 0);
        }, 0);
        resolve(number);
      });
    });
  });
};

let getNumberOfDesktopViewers = () => {
  const requestType = "getActiveVisits";
  const parameters = "FolderID=699623076574954132";

  const location = getRequestURL(requestType, parameters);
  return new Promise(resolve => {
    http.get(location, (res) => {
      let data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        let par = JSON.parse(data);
        let number = par.Data.reduce((prev, cur) => {
          return prev + (cur.UserAgent.includes("Mobile") ? 0 : 1);
        }, 0);
        resolve(number);
     });

    });
  });
};

let getActiveChats = () => {
  const requestType = "getActiveChats";
  const parameters = "FolderID=699623076231086325";

  const location = getRequestURL(requestType, parameters);
  return new Promise(resolve => {
    http.get(location, (res) => {
      let data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        let par = JSON.parse(data);
        console.log(par);
        let result = par.Data.length;
        resolve(result);
      });

    });
  });

}

router.get('/', async (ctx) => {

  /**
   *  Account ID: 706505873793485629
   * API Settings: 1645412287691666032
   * API Key: 4UQadjX14fasZR0f/VTKLGfM1VMV9oaOIcK5bLppG93o8ICp4Fx4p2G6lvY2ztqrwP9R7lenJ5MWyJIGCvHicg==
   * 
   * 
   * 
   */


  let activeChats = await getActiveChats();
  let mobileVisitors = await getNumberOfMobileViewers();
  let desktopVisitors = await getNumberOfDesktopViewers();
  await ctx.render('index', {
    title: 'Hello Koa 2!',
    activeChats: activeChats,
    mobileVisitors: mobileVisitors,
    desktopVisitors: desktopVisitors,
  });
});

let getOperators = () => {

  const requestType = "getOperators";
  const parameters = "";

  const location = getRequestURL(requestType, parameters);

  return new Promise(resolve => {
    http.get(location, (res) => {
      let data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        let par = JSON.parse(data);
        console.log(par);
        let result = [];
        for (let d of par.Data) {
          let r = {
            loginID: d.LoginID,
            name: d.Name,
            twitterService: d.TwitterService,
            emailService: d.EmailService,
            chatService: d.ChatService,
            smsService: d.SmsService,
            facebookService: d.FacebookService,
            ticketService: d.TicketService,
          }
          result.push(r);
        }

        resolve(result);
      });

    });
  });
};


router.get('/api/getOperators', async (ctx) => {
  let operators = await getOperators();

  ctx.body = {
    data: operators,
  };
});

module.exports = router;
