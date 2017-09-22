import Router from 'koa-router';
import CryptoJS from 'crypto-js';
import http from 'https';

const router = new Router(); // require('koa-router')()

const ServiceTypeChat = 1,
  ServiceTypeEmail = 3,
  ServiceTypeTicket = 5,
  ServiceTypeSMS = 9,
  ServiceTypeTwitter = 10;

const StatusTypeLoggedOut = 0,
  StatusTypeAway = 1,
  StatusTypeAvailable = 2;

const accountId = process.env.ACCOUNT_ID;
const apiSettings = process.env.API_SETTINGS;
const apiKey = process.env.API_KEY;


/**
 * getRequestURL is a utility function that formats the api URL to be used based on the request type and parameters
 * 
 * @param {any} requestType 
 * @param {any} parameters 
 * @returns 
 */
let getRequestURL = (requestType, parameters) => {
  const auth = accountId + ':' + apiSettings + ':' + (new Date()).getTime();
  const authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);

  let url = "https://api.boldchat.com/aid/" + accountId + "/data/rest/json/v1/" + requestType + "?auth=" + authHash + (parameters.length > 0 ? ("&" + parameters) : "");
  return url
}

/**
 * getNumberOfMobileViewers gets the number of visitors that are on mobile devices by sniffing the user agent.  
 * It also uses a hardcoded folder ID value, if there is a more dynamic way it should be implemented.
 * 
 * @returns A promise that resolves to a number
 */
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
        let result = par.Data.length;
        resolve(result);
      });
    });
  });
}


/**
 * Gets a list of active operators
 * 
 * @returns a list of operators 
 */
let getOperators = () => {

  const requestType = "getOperatorAvailability";
  const parameters = `ServiceTypeID=${ServiceTypeChat}`;

  const location = getRequestURL(requestType, parameters);

  return new Promise(resolve => {
    http.get(location, (res) => {
      let data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        let par = JSON.parse(data);
        let result = par.Data.map(d => {
          return {
            loginID: d.LoginID,
            clientID: d.ClientID,
            name: d.Name,
            chatService: d.StatusType == StatusTypeAvailable,
          }
        });
        resolve(result);
      });
    });
  });
};



/**
 * setOperatorStatus sets the availability of the operator for a specific service.
 * Helper function to interact with the BoldChat api.
 * 
 * @param {any} operatorID 
 * @param {any} serviceTypeID 
 * @param {any} clientID 
 * @param {any} statusType 
 * @returns a Promise with the result of the update
 */
let setOperatorStatus = (operatorID, serviceTypeID, clientID, statusType) => {

  let params = [
    `ServiceTypeID=${serviceTypeID}`,
    `OperatorID=${operatorID}`,
    `ClientID=${clientID}`,
    `StatusType=${statusType}`,
  ];
  let url = getRequestURL("setOperatorAvailability", params.join("&"))
  return new Promise(resolve => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        let par = JSON.parse(data);
        resolve(par.Status);
      });
    });
  });

}

/**
 * ROUTES
 */
router.get('/', async(ctx) => {
  let activeChats = await getActiveChats();
  let mobileVisitors = await getNumberOfMobileViewers();
  let desktopVisitors = await getNumberOfDesktopViewers();
  await ctx.render('index', {
    activeChats: activeChats,
    mobileVisitors: mobileVisitors,
    desktopVisitors: desktopVisitors,
  });
});



router.post('/api/setOperatorAvailability', async(ctx) => {
  let d = ctx.request.body;
  let operators = await setOperatorStatus(d.operatorID, d.serviceTypeID, d.clientID, d.statusType);

  ctx.body = {
    data: operators,
  };
});

router.get('/api/getOperators', async(ctx) => {
  let operators = await getOperators();

  ctx.body = {
    data: operators,
  };
});

module.exports = router;