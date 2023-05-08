const Base = require('./base');

class Asos extends Base {

    constructor(url, size, threshold) {
        super();
        this.url = url;
        this.size = size;
        this.threshold = threshold;
    }

    async switchCountry() {
        const changeButton = await this.page.locator('#chrome-header >> div[data-testid="country-selector"] >> button[data-testid="country-selector-btn"]');
        await changeButton.click();

        const country = await this.page.locator('#chrome-modal-container >> #country');
        await country.selectOption({ 'value' : 'CA' });

        const update = await this.page.locator('#chrome-modal-container >> button[data-testid="save-country-button"]');
        await update.click();
    }

    async check() {
        const title = await this.page.locator('#pdp-react-critical-app >> h1');
        this.title = await title.innerText();

        await this.switchCountry();

        await this.page.waitForLoadState('domcontentloaded');

        const price = await this.page.locator('#core-product >> span[data-testid="current-price"]').innerText();
        this.price = parseFloat(price.replace('C$', '').replace('Now', '').trim());
        
        const oos = await this.page.locator('#core-product >> h3[data-testid="outOfStockLabel"]').count();
        if (oos > 0) {
            return;
        }

        const selector = await this.page.locator('#main-size-select-0');
        await this.page.waitForSelector('#main-size-select-0 >> option', { state: 'attached' });
        const sizes = await selector.locator('option').all();

        for (const option of sizes) {
            const size = (await option.innerText()).trim();
            const disabled = await option.getAttribute('disabled');
            if (disabled === null && size === this.size) {
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
    return await new Asos(config.url, config.size, config.threshold).run();
}

module.exports = {
    run: run
};