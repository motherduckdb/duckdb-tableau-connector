import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

/** Connects with the URL and properties from connection.mjs and runs what Tableau needs to work. */
public class Smoke {
    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String url = in.readLine();
        Properties properties = new Properties();
        for (String line; (line = in.readLine()) != null; ) {
            properties.setProperty(line.substring(0, line.indexOf('=')), line.substring(line.indexOf('=') + 1));
        }

        try (Connection connection = DriverManager.getConnection(url, properties);
             Statement statement = connection.createStatement()) {
            String database = query(statement, "SELECT current_database()");
            String userAgent = query(statement, "PRAGMA user_agent");
            check(userAgent.contains(" tableau/"), "user agent is " + userAgent);

            if (url.startsWith("jdbc:duckdb:md:")) {
                check(url.startsWith("jdbc:duckdb:md:" + database), "connected to " + database + ", not the database in " + url);
                // The schema browser, and catalog-qualified names as CAP_JDBC_INCLUDE_CATALOG_NAME makes Tableau write them.
                String schema, table;
                try (ResultSet tables = connection.getMetaData().getTables(database, null, "%", null)) {
                    check(tables.next(), "no tables listed in " + database);
                    schema = tables.getString("TABLE_SCHEM");
                    table = tables.getString("TABLE_NAME");
                }
                query(statement, String.format("SELECT count(*) FROM \"%s\".\"%s\".\"%s\"", database, schema, table));
                System.out.println("ok: " + database + " as " + userAgent + ", read " + schema + "." + table);
            } else {
                // In-memory databases get their data from Initial SQL, so they must be writable.
                statement.execute("CREATE VIEW answer AS SELECT 42 AS x");
                check("42".equals(query(statement, "SELECT x FROM answer")), "could not read back a view");
                System.out.println("ok: " + database + " as " + userAgent);
            }
        }
    }

    static String query(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getString(1);
        }
    }

    static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
