export class AliasAlreadyExistsError extends Error {
    constructor(alias) {
    const message = `Alias "${alias}" already exists`;
    super(message);
    this.name = 'AliasAlreadyExistsError';
    this.status = 409;
    this.alias = alias;
  }
}

export class AliasIsExpiredError extends Error {
  constructor(message = 'Alias is expired') {
    super(message);
    this.name = 'AliasIsExpiredError';
    this.status = 404;
  }
}

export class AliasDoesNotExistError extends Error {
  constructor(message = 'Alias does not exist') {
    super(message);
    this.name = 'AliasDoesNotExistError';
    this.status = 404;
  }
}