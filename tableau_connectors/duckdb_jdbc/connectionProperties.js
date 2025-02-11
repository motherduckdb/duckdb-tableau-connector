(function propertiesbuilder(attr) {
    const MOTHERDUCK_CONNECTOR_VERSION = '1.1.1';

    // These are the DBClientConfig properties
    var props = {};
    props['duckdb.read_only'] = (attr[connectionHelper.attributeServer] !== 'memory');
    props['custom_user_agent'] = 'tableau/' + MOTHERDUCK_CONNECTOR_VERSION + '('
        + connectionHelper.GetProductName()
        + '/' + connectionHelper.GetProductVersion()
        + ' ' + connectionHelper.GetPlatform() + ')';
    if (attr[connectionHelper.attributePassword]) {
         props['motherduck_token'] = attr[connectionHelper.attributePassword];
     }
    return props;
})
