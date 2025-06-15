import ms from "ms";

export interface CreateUrlRequestBody {
  url: string;
  alias: string;
  expiresIn?: ms.StringValue;
}
