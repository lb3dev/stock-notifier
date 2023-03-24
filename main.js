const fs = require('fs');
const { stringify } = require('csv-stringify');
const { DateTime } = require('luxon');
const uniqlo = require('./src/uniqlo');
const converse = require('./src/converse');
const gravitypope = require('./src/gravitypope');
const muji = require('./src/muji');
const sportinglife = require('./src/sportinglife');

async function runAll() {
    const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
    let rows = [];

    let uniqloConfigs = config['Uniqlo'] || [];
    for (const config of uniqloConfigs) {
        rows = rows.concat(await uniqlo.run(config));
    }

    let converseConfigs = config['Converse'] || [];
    for (const config of converseConfigs) {
        rows = rows.concat(await converse.run(config));
    }

    let gravityPopeConfigs = config['GravityPope'] || [];
    for (const config of gravityPopeConfigs) {
        rows = rows.concat(await gravitypope.run(config));
    }

    let sportingLifeConfigs = config['SportingLife'] || [];
    for (const config of sportingLifeConfigs) {
        rows = rows.concat(await sportinglife.run(config));
    }

    let mujiConfigs = config['Muji'] || [];
    for (const config of mujiConfigs) {
        rows = rows.concat(await muji.run(config));
    }

    const columns = [
        'url',
        'title',
        'price',
        'threshold',
        'stock',
        'sale',
        'hit'
    ];

    if (!fs.existsSync('stocks')) {
        fs.mkdirSync('stocks');
    }
    
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd-HH-mm-ss.SSS');
    const output = fs.createWriteStream(`stocks/stocks-${timestamp}.csv`);
    const stringifier = stringify({ header: true, columns: columns,
        cast: {
            boolean: (value) => value ? "true" : "false"
        }
    });
    rows.forEach(row => {
        stringifier.write(row);
    });
    stringifier.pipe(output);
}

runAll();