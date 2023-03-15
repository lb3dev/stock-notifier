const { chromium } = require('playwright');

class Base {

    constructor() {
        this.delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        this.url = '';
        this.title = '';
        this.price = 0;
        this.threshold = 0;
        this.inStock = false;
        this.onSale = false;
        this.hit = false;
        this.rows = [];
    }

    async openPage() {
        this.browser = await chromium.launch({
            headless: false
        });
    
        const context = await this.browser.newContext({
            locale: 'en-CA',
            colorScheme: 'dark',
            viewport: {
                width: 3840,
                height: 2160
            }
        });

        this.page = await context.newPage();
        await this.page.goto(this.url);
    }

    async close() {
        await this.page.close();
        await this.browser.close();
    }

    row() {
        this.rows.push([this.url, this.title, this.price, this.threshold, this.inStock, this.onSale, this.hit]);
    }

    async run() {
        try {
            await this.openPage();
            await this.check();
        } catch (err) {
            console.error(err);
        } finally {
            await this.close();
        }
        
        return this.rows;
    }
}

module.exports = Base;