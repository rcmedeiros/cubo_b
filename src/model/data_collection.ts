import { Data } from "./data";

interface Collection { [name: string]: Data };
export class DataCollection {
    private readonly collection: Collection = {};
    private nextId = 0;

    public total(c: Collection): number {
        return Object.keys(c)
            .map((k: string) => c[k].participation)
            .reduce((previous: number, current: number) => previous + current)
    }

    public set(data: Data): boolean {
        const hash = data.firstName.toLowerCase() + data.lastName.toLowerCase();
        const tmp: Collection = { ...this.collection };
        tmp[hash] = data;

        if (this.total(tmp) > 100) {
            return false;
        } else {
            data.id = this.collection[hash]?.id || ++this.nextId;
            this.collection[hash] = data;
            return true;
        }

    }

    public get(): Array<Data> {
        return Object.keys(this.collection).map((k: string) => this.collection[k]);
    }
}