const Base = require('./base');

class GrantStone extends Base {

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
        await this.page.waitForLoadState('domcontentloaded');

        let notAvailable = (await this.page.locator('a[href="/collections/all"]').count()) > 0;
        if (notAvailable) {
            return;
        }

        const title = await this.page.locator('h1.product-title');
        this.title = await title.innerText();

        const price = await this.page.locator('span.money[data-product-price=""]');
        this.onSale = (await this.page.locator('span.money[data-compare-price=""]').count()) > 0;
        let money = await price.innerText();
        money = money.replace('$', '').replace('USD','').trim();
        this.price = parseFloat(money);

        const select = await this.page.locator('div.selector-wrapper >> select.single-option-selector');
        const options = await this.page.locator('div.selector-wrapper >> select.single-option-selector >> option').all();
        for (const option of options) {
            const value = (await option.getAttribute('value')).trim();
            if (value.startsWith(size)) {
                this.title = value;

                await select.selectOption(value);
                const cart = await this.page.locator('button#AddToCart');
                const disabled = await cart.getAttribute('disabled');
                if (disabled !== "") {
                    this.inStock = true;
                    this.hit = this.price <= this.threshold;
                }
                this.row(); 
            }
        }
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
    return await new GrantStone(config.url, config.sizes, config.threshold).run();
}

module.exports = {
    run: run
};