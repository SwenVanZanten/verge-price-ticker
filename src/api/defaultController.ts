import * as core  from "express-serve-static-core";

export const sendError = (res: core.Response, error: string) => {
  res.set("Content-Type", "application/json");
  res.status(400);
  res.send({
    error
  });
};

export const sendJSON = (res: core.Response, object: any) => {
  res.set("Content-Type", "application/json");
  res.send(JSON.stringify(object));
};
