const fs = require('fs');
const { stringify } = require('csv-stringify');
const { DateTime } = require('luxon');
const asos = require('./src/asos');
const uniqlo = require('./src/uniqlo');
const converse = require('./src/converse');
const holt = require('./src/holtrenfrew');
const gravitypope = require('./src/gravitypope');
const muji = require('./src/muji');
const simons = require('./src/simons');
const sportinglife = require('./src/sportinglife');

async function runAll() {
    const configs = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
    const brands = {
        'Uniqlo'      : uniqlo.run,
        'Converse'    : converse.run,
        'GravityPope' : gravitypope.run,
        'SportingLife': sportinglife.run,
        'Muji'        : muji.run,
        'Simons'      : simons.run,
        'Asos'        : asos.run,
        'Holt'        : holt.run
    };

    let rows = [];

    for (let [brand, run] of Object.entries(brands)) {
        let brandConfigs = configs[brand] || [];
        for (const config of brandConfigs) {
            rows = rows.concat(await run(config));
        }
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