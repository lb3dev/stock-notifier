const Base = require('./base');

class Simons extends Base {

    constructor(url, threshold) {
        super();
        this.url = url;
        this.threshold = threshold;
    }

    async check() {
        const title = await this.page.locator('div.productTitle');
        this.title = (await title.innerText()).trim();

        const price = await this.page.locator('span.price.salePrice').innerText();
        this.onSale = (await this.page.locator('span.price.strike').count()) > 0;
        this.price = parseFloat(price.replace('$', '').replace('Can', '').trim());

        this.inStock = (await this.page.locator('div.out_of_stock_button').count()) === 0;

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }
}

async function run(config) {
    return await new Simons(config.url, config.threshold).run();
}

module.exports = {
    run: run
};