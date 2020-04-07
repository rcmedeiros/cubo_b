import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import figlet from 'figlet';
import fs from 'fs';
import helmet from 'helmet';
import { Server } from 'http';
import path from 'path';
import swaggerUiExpress from 'swagger-ui-express';

import { DEFAULT_SERVER_PORT, ENDPOINT_API, ENDPOINT_HEALTH_CHECK, ENDPOINT_OPEN_API, MODULE_NAME } from './constants/defaults';
import { HttpStatusCode } from './constants/http_status_code';
import { DataController } from './controllers/data-ctrl';
import { HttpError } from './error/http-error';

export class CubeServer {
    private readonly app: core.Express;
    private server: Server;
    private controllers: { [endpoint: string]: unknown } = {};

    constructor(port?: number) {
        this.app = express();
        this.app.set('port', port || DEFAULT_SERVER_PORT);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.raw());
        this.app.use(compression());
        this.app.use(helmet());
        this.app.use(cors({}));
    }

    private banner(): void {

        figlet.text(MODULE_NAME, {
            font: 'Star Wars',
            horizontalLayout: 'default',
            verticalLayout: 'default',
        }, (err: Error, data: string) => {
            /* istanbul ignore if */
            if (err) {
                console.error('Figlet failed...', err);
            } else {
                console.info(data);
                const port: number = this.app.get('port');
                console.table({
                    Port: port,
                    Docs: `http://localhost:${port}${ENDPOINT_OPEN_API}`,
                    'Health Check': `http://localhost:${port}${ENDPOINT_HEALTH_CHECK}`
                })
            }
        });
    }

    private assignRoutes(): void {

        this.app.get(ENDPOINT_HEALTH_CHECK, (_request: Request, response: Response) => {
            response.sendStatus(HttpStatusCode.OK); // Should test all dependencies
        });

        if (!process.env.NODE_ENV || !process.env.NODE_ENV.startsWith('prod')) {
            const json: object = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json')).toString());
            this.app.use(ENDPOINT_OPEN_API, swaggerUiExpress.serve, swaggerUiExpress.setup(json));
        }

        this.controllers.getData = new DataController();
        this.app.get(`${ENDPOINT_API}/data`, (_req: Request, res: Response) => {
            const ctrl: DataController = this.controllers.getData as DataController;
            res.json(ctrl.get())
        })
        this.app.post(`${ENDPOINT_API}/data`, (req: Request, res: Response) => {
            const ctrl: DataController = this.controllers.getData as DataController;
            try {
                ctrl.set(req.body);
                res.sendStatus(HttpStatusCode.ACCEPTED);
            } catch (e) {
                if ((e as HttpError).code) {
                    res.status((e as HttpError).code).json({ error: e.message })
                } else {
                    res.sendStatus(HttpStatusCode.INTERNAL_SERVER_ERROR);
                }

            }
        })
    }

    public async listen(): Promise<Server> {
        return new Promise((resolve: Function, reject: Function) => {
            this.assignRoutes();
            this.server = this.app.listen(this.app.get('port'), (err: Error) => {
                /* istanbul ignore if */
                if (err) { reject(err) } else {
                    this.banner();
                    resolve(this.server);
                }
            });
        })
    }

    public async close(): Promise<void> {
        return new Promise((resolve: Function, reject: Function): void => {
            this.server.close((err: Error) => {
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
