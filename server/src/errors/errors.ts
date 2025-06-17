import { Alias } from "@url-shortener/shared-types";

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
  constructor(alias: Alias) {
    super("AliasIsExpiredError", `Alias "${alias}" is expired`, 404);
  }
}

export class AliasDoesNotExistError extends CustomError {
  constructor(alias: Alias) {
    super("AliasDoesNotExistError", `Alias "${alias}" does not exist`, 404);
  }
}
