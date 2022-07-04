import db from "../db.js";
import loginSchema from "../schemas/loginSchema.js";
import registerSchema from "../schemas/registerSchema.js";

export async function tokenValidation(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.sendStatus(401);
    return;
  }

  const session = await db
    .collection("onlineUsers")
    .findOne({ accessToken: token });

  if (!session) {
    return res.sendStatus(401);
  }

  res.locals.session = session;
  next();
}

export async function registerValidation(req, res, next) {
  const validation = registerSchema.validate(req.body);

  if (validation.error) {
    return res.sendStatus(422);
  }

  next();
}

export async function userValidation(req, res, next) {
  const newUser = req.body;
  const existingUser = await db
    .collection("users")
    .findOne({ email: newUser.email });
  if (existingUser) {
    console.log("user")
    res.sendStatus(422);
    return;
  }
  next();
}

export async function loginValidation(req, res, next) {
  const validation = loginSchema.validate(req.body);

  if (validation.error) {
    console.log("login")
    return res.sendStatus(422);
  }

  next();
}
