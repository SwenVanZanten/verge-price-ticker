import * as core  from "express-serve-static-core";
import fetch from "node-fetch";
import { sendError, sendJSON } from "./defaultController";

export const getIpDetails = async (req: core.Request, res: core.Response) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    fetch(`http://api.ipstack.com/${ip}?access_key=a9e03264eab585d224212a5edcac8fcf&format=1`)
      .then(response => response.json())
      .then(json => {
        sendJSON(res, json);
      });
  } catch (e) {
    sendError(res, "Couldn't fetch IP data.");
  }
};
