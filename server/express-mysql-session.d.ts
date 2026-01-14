declare module 'express-mysql-session' {
    import { Store } from 'express-session';
    import { SessionOptions } from 'express-session';

    interface MySQLStoreOptions {
        host?: string;
        port?: number;
        user?: string;
        password?: string;
        database?: string;
        createDatabaseTable?: boolean;
        schema?: {
            tableName?: string;
            columnNames?: {
                session_id?: string;
                expires?: string;
                data?: string;
            };
        };
        checkExpirationInterval?: number;
        expiration?: number;
    }

    function MySQLStore(session: any): {
        new(options: MySQLStoreOptions): Store;
    };

    export = MySQLStore;
}
