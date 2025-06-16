import { Alias } from "@shared/types.js";

class CustomError extends Error {
  public status: number;

  constructor(name: string, message: string, status: number) {
    super(message);
    this.name = name;
    this.status = status;
  }
}

export class AliasAlreadyExistsError extends CustomError {
  constructor(alias: Alias) {
    super("AliasAlreadyExistsError", `Alias "${alias}" already exists`, 409);
  }
}

export class AliasIsExpiredError extends CustomError {
  constructor() {
    super("AliasIsExpiredError", "Alias is expired", 404);
  }
}

export class AliasDoesNotExistError extends CustomError {
  constructor() {
    super("AliasDoesNotExistError", "Alias does not exist", 404);
  }
}
