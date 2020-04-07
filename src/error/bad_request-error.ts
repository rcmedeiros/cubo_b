import { HttpStatusCode } from "../constants/http_status_code";
import { HttpError } from "./http-error";

export class BadRequestError extends HttpError {
    constructor(message: string) {
        super(message);
        this.code = HttpStatusCode.BAD_REQUEST
    }
}
