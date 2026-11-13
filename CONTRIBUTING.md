# Developing DuckDB Tableau Connector

## Notes on manifest.xml
### <connector-plugin> tag
* `plugin-version` attribute is the version seen by users in Tableau Exchange. The repo carries `0.0.0`;
the Release workflow stamps the real version in when it packages, so don't edit it.
* `version` attribute refers to an internal Tableau version and should not be changed.

### <connection-customization>
* `version` attribute is not used by Tableau.
Leave it at 1.0 unless connection-customization changes.

## Releasing

See [Releasing in the README](./README.md#releasing). The Release workflow stamps the version into both
`manifest.xml` (`plugin-version`) and `connectionProperties.js` (`MOTHERDUCK_CONNECTOR_VERSION`); never bump
them in the repo.

## Running an unsigned connector

[See the detailed steps](./docs/unsigned_connector.md).

## Running connector under development

On Windows:
```
tableau.exe -DConnectPluginsPath=[CONNECTOR_LOCATION]
```

## Testing

CI smoke-tests the connection on every pull request: it evaluates the connector scripts the way Tableau does and
uses the resulting URL and properties with the DuckDB JDBC driver, in memory and against MotherDuck. Locally:

```sh
node testing/smoke/connection.mjs memory | java -cp duckdb_jdbc.jar testing/smoke/Smoke.java
node testing/smoke/connection.mjs motherduck sample_data "$MOTHERDUCK_TOKEN" | java -cp duckdb_jdbc.jar testing/smoke/Smoke.java
```

It doesn't cover the dialect: run the TDVT suite (`testing/config`) in Tableau Desktop before releasing a change
to `dialect.tdd`.
