(function dsbuilder(attr) {

    var connectionString = "";

    if (attr[connectionHelper.attributeServer] === "local") {
        connectionString = String(attr['v-connection_string_file']);
    } else if (attr[connectionHelper.attributeServer] === "motherduck") {
        connectionString = String(attr['v-connection_string_md']);
        if (!connectionString.startsWith("md:")) {
            // if `md:` prefix is not already there, add it.
            connectionString = "md:" + connectionString;
        }
        if (attr[connectionHelper.attributeTableauServerUser] && !connectionString.includes("session_name=") && !connectionString.includes("session_hint=")) {
            let delimiter = connectionString.includes("?") ? "&" : "?";  // In case there are query parameters already
            connectionString = connectionString + delimiter + "session_name=" + attr[connectionHelper.attributeTableauServerUser];
        }
    } else if (attr[connectionHelper.attributeServer] === "memory") {
        connectionString = ":memory:";
    }

    if (connectionString.startsWith("md:")) {
        // Validate that a default database is provided, so queries can be fully qualified when in MotherDuck mode
        var match = connectionString.match(/^md:(.*)(\?.*)?$/);
        if (match[1] == '') {
            var errorMessage = 'Please specify a database when connecting using MotherDuck.';
            errorMessage += '\n' + 'A connection string should begin with "md:my_database_name",';
            errorMessage += 'and may be optionally followed by parameters in the format "?parameter1=value1&parameter2=value2".';
            errorMessage += '\n' + 'For details, visit https://motherduck.com/docs/integrations/jdbc-driver.';

            return connectionHelper.ThrowTableauException(errorMessage);
        }
    }

    let url = "jdbc:duckdb:";  // `jdbc:duckdb:` or `jdbc:duckdb::memory:` are equivalent
    url +=  connectionString;

    return [url];
})
