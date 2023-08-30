const Base = require('./base');

class GravityPope extends Base {

    constructor(url, sizes, threshold) {
        super();
        this.url = url;
        this.sizes = sizes;
        this.threshold = threshold;
    }

    async checkSize(size) {
        if (!size) {
            return;
        }
        this.hit = false;

        const title = await this.page.locator('h1.product-name');
        this.title = await title.innerText();

        const price = await this.page.locator('#ProductPrice');
        this.onSale = (await price.getAttribute('class')).includes('sale');
        let money = await price.locator('span.money').innerText();
        money = money.replace('$', '').trim();
        this.price = parseFloat(money);

        const sizes = await this.page.locator('select.select-type__size >> option').all();
        for (const size of sizes) {
            const value = await size.getAttribute('value');
            const disabled = await size.isDisabled();
            if (!disabled && value === this.size) {
                this.inStock = true;
                break;
            } 
        }

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }

    async check() {
        if (this.sizes) {
            for (const size of this.sizes) {
                await this.checkSize(size);
            }
        }
    }
}

async function run(config) {
    return await new GravityPope(config.url, config.sizes, config.threshold).run();
}

module.exports = {
    run: run
};