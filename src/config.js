const _slugify = require('./helpers/slugify')
var _get = require('lodash.get');

var baseConfig = {}
try{
  baseConfig = require('../../../config/local');
}catch (e) {
  console.warn('Unabale to locate base config');
}

var baseStoreConfig = {};
if(_get(baseConfig, 'availableStores', []).length > 0){
  baseStoreConfig = _get(
    baseConfig,
    'storeViews.' + _get(baseConfig, 'availableStores.0', 'default'),
    {}
  )
}
var elasticSearchUrl = false;
if(_get(baseStoreConfig, 'elasticsearch.host', false)
  && _get(baseStoreConfig, 'elasticsearch.port', false)
  && _get(baseStoreConfig, 'elasticsearch.protocol', false)
){
  elasticSearchUrl = _get(baseStoreConfig, 'elasticsearch.protocol', false) 
    + '://' 
    + _get(baseStoreConfig, 'elasticsearch.host', false)
    + ':' 
    + _get(baseStoreConfig, 'elasticsearch.port', false)  
}

module.exports = {

  seo: {
    useUrlDispatcher: _get(baseConfig, 'mage2vue.seo_use_url_dispatcher', JSON.parse(process.env.SEO_USE_URL_DISPATCHER || true)),
    productUrlPathMapper: (product) => {
      return product.url_key;
      const destPath = product.url_key + '/'
      console.log('Dest. product path = ', destPath)
      return destPath

      // let destPath = ''
      // if (product.category && product.category.length > 0) {
      //   const firstCat = product.category[0]
      //   destPath = (firstCat.path ? (firstCat.path) : _slugify(firstCat.name)) + '/' + (product.slug ? product.slug : _slugify(product.name + '-' + product.id))
      // } else {
      //   destPath = (product.slug ? product.slug : _slugify(product.name + '-' + product.id))
      // }
      // destPath += '.html'
      // console.log('Dest. product path = ', destPath)
      // return destPath
    },
    categoryUrlPathMapper: (category) => {
      return category.url_key;
      //const destSlug = (category.url_path ? category.url_path + '/': '') + category.url_key
      const destSlug = category.url_path + '/'
      console.log('Dest. cat path = ', destSlug)
      return destSlug
    },
  },

  magento: {
    url: _get(baseConfig, 'magento2.api.url', (process.env.MAGENTO_URL || 'http://magento2.demo-1.divante.pl/rest/')),
    consumerKey: _get(baseConfig, 'magento2.api.consumerKey', (process.env.MAGENTO_CONSUMER_KEY || 'alva6h6hku9qxrpfe02c2jalopx7od1q')),
    consumerSecret: _get(baseConfig, 'magento2.api.consumerSecret', (process.env.MAGENTO_CONSUMER_SECRET || '9tgfpgoojlx9tfy21b8kw7ssfu2aynpm')),
    accessToken: _get(baseConfig, 'magento2.api.accessToken', (process.env.MAGENTO_ACCESS_TOKEN || 'rw5w0si9imbu45h3m9hkyrfr4gjina8q')),
    accessTokenSecret: _get(baseConfig, 'magento2.api.accessTokenSecret', (process.env.MAGENTO_ACCESS_TOKEN_SECRET || '00y9dl4vpxgcef3gn5mntbxtylowjcc9')),
    storeId: _get(baseStoreConfig, 'storeId', (process.env.MAGENTO_STORE_ID || 1)),
    currencyCode: _get(baseStoreConfig, 'i18n.currencyCode', (process.env.MAGENTO_CURRENCY_CODE || 'USD')),
    msi: { 
      enabled: _get(baseStoreConfig, 'msi.enabled', (process.env.MAGENTO_MSI_ENABLED || false)), 
      stockId: _get(baseStoreConfig, 'msi.defaultStockId', (process.env.MAGENTO_MSI_STOCK_ID || 1)) 
    }
  },

  vuestorefront: {
    invalidateCache: _get(baseConfig, 'mage2vue.invalidate_cache', (JSON.parse(typeof process.env.VS_INVALIDATE_CACHE === 'undefined' ? false : process.env.VS_INVALIDATE_CACHE))),
    invalidateCacheUrl: _get(baseConfig, 'mage2vue.invalidate_cache_url', (process.env.VS_INVALIDATE_CACHE_URL || 'http://localhost:3000/invalidate?key=aeSu7aip&tag='))
  },

  product: {
    expandConfigurableFilters: _get(baseConfig, 'mage2vue.product.expand_configurable_filters', ['manufacturer']),
    synchronizeCatalogSpecialPrices: _get(baseConfig, 'mage2vue.product.synchronize_catalog_special_prices', (process.env.PRODUCTS_SPECIAL_PRICES || false)),
    renderCatalogRegularPrices: _get(baseConfig, 'mage2vue.product.render_catalog_regular_prices', (process.env.PRODUCTS_RENDER_PRICES || false)),
    excludeDisabledProducts: _get(baseConfig, 'mage2vue.product.exclude_disabled_products', (process.env.PRODUCTS_EXCLUDE_DISABLED || false))
  },

  kue: {}, // default KUE config works on local redis instance. See KUE docs for non standard redis connections

  db: {
    driver: 'elasticsearch',
    url: elasticSearchUrl || process.env.DATABASE_URL || 'http://localhost:9200',
    user: _get(baseStoreConfig, 'elasticsearch.user', ''),
    password: _get(baseStoreConfig, 'elasticsearch.password', ''),
    indexName: _get(baseStoreConfig, 'elasticsearch.index', (process.env.INDEX_NAME || 'vue_storefront_catalog'))
  },

  elasticsearch: {
    apiVersion: _get(baseStoreConfig, 'elasticsearch.apiVersion', (process.env.ELASTICSEARCH_API_VERSION || '5.6'))
  },

  redis: {
    host: _get(baseConfig, 'redis.host', (process.env.REDIS_HOST || '127.0.0.1')),
    port: _get(baseConfig, 'redis.port', (process.env.REDIS_PORT || 6379)),
    auth: _get(baseConfig, 'redis.auth', ''),
    db: _get(baseConfig, 'redis.db', (process.env.REDIS_DB || 0))
  },

  passport: {
    jwtSecret: _get(baseConfig, 'mage2vue.passport.jwt_secret', 'MyS3cr3tK3Y'),
    jwtSession: {
      session: _get(baseConfig, 'mage2vue.passport.jwt_session', false)
    }
  }

}
