// Evaluates the connector scripts the way Tableau does and prints the JDBC URL (first line) and the
// driver properties (key=value lines) for Smoke.java.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const connectionHelper = {
    attributeServer: 'server',
    attributePassword: 'password',
    attributeTableauServerUser: 'tableau-server-user',
    GetProductName: () => 'smoke-test',
    GetProductVersion: () => '0',
    GetPlatform: () => process.platform,
    ThrowTableauException: (message) => { throw new Error(message); },
};
const connector = new URL('../../tableau_connectors/duckdb_jdbc/', import.meta.url);
const load = (file) => new Function('connectionHelper', 'return ' + readFileSync(new URL(file, connector), 'utf8'))(connectionHelper);
const buildUrl = load('connectionBuilder.js');
const buildProperties = load('connectionProperties.js');
const userAgent = `tableau/0.0.0(smoke-test/0 ${process.platform})`;

assert.deepEqual(buildUrl({ server: 'memory' }), ['jdbc:duckdb::memory:']);
assert.deepEqual(buildUrl({ server: 'local', 'v-connection_string_file': '/data/my.duckdb' }), ['jdbc:duckdb:/data/my.duckdb']);
assert.deepEqual(buildUrl({ server: 'motherduck', 'v-connection_string_md': 'my_db' }), ['jdbc:duckdb:md:my_db']);
assert.deepEqual(buildUrl({ server: 'motherduck', 'v-connection_string_md': 'md:my_db?saas_mode=true', 'tableau-server-user': 'alice' }),
    ['jdbc:duckdb:md:my_db?saas_mode=true&session_name=alice']);
assert.deepEqual(buildUrl({ server: 'motherduck', 'v-connection_string_md': 'my_db?session_name=mine', 'tableau-server-user': 'alice' }),
    ['jdbc:duckdb:md:my_db?session_name=mine']);
assert.throws(() => buildUrl({ server: 'motherduck', 'v-connection_string_md': '' }), /specify a database/);
assert.deepEqual(buildProperties({ server: 'memory' }), { 'duckdb.read_only': false, custom_user_agent: userAgent });
assert.deepEqual(buildProperties({ server: 'motherduck', password: 'secret' }),
    { 'duckdb.read_only': true, custom_user_agent: userAgent, motherduck_token: 'secret' });

const [server, database, token] = process.argv.slice(2);
assert.ok(server === 'memory' || (server === 'motherduck' && database && token),
    'usage: connection.mjs memory | connection.mjs motherduck <database> <token>');
const attr = { server, 'v-connection_string_md': database, password: token };
console.log(buildUrl(attr)[0]);
for (const [key, value] of Object.entries(buildProperties(attr))) console.log(`${key}=${value}`);
