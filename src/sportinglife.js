const Base = require('./base');

class SportingLife extends Base {

    constructor(url, size, threshold) {
        super();
        this.url = url;
        this.size = size;
        this.threshold = threshold;
    }

    async check() {
        const title = await this.page.locator('#product-content >> span.product-name');
        this.title = await title.innerText();

        const price = await this.page.locator('#product-content >> span.price-sales').first();
        this.onSale = (await price.getAttribute('class')).includes('has-standard-price');
        let money = await price.innerText();
        money = money.replace('$', '');
        this.price = parseFloat(money);

        const sizes = await this.page.locator('select#va-size >> option').all();
        for (const size of sizes) {
            const value = (await size.innerText()).trim();
            if (value === this.size) {
                this.inStock = true;
                break;
            } 
        }

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }
}

async function run(config) {
    return await new SportingLife(config.url, config.size, config.threshold).run();
}

module.exports = {
    run: run
};