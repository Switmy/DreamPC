const axios = require('axios');
const fs = require('fs');

const brand = "NZXT";
const category = "case";
const searchTerm = `${brand} ${category}`; // Combines both
const page = 2;

const params = {
  api_key: "D468350A23AF48B7AF69ABBDEB4CAE5A",
  type: "search",
  amazon_domain: "amazon.com",
  search_term: searchTerm,
  page: page,
  currency: "usd",
  output: "json",
  sort_by: "relevanceblender",
  min_rating: 3,
  min_reviews: 50,
};

const specstosearch = `format, motherboard size support, max gpu_length, 120mm fan support, 140mm fan support, gpu slots, gpu riser slots, front panel connectics, included fans quantity`;
const specstable = 'case_'; 
const specstablecolumns = `"value" (integer), "format" (short, like "ATX" or "mITX") (text), "motherboard_support" (text), "gpu_length" (integer), "120_fan_support" (integer), "140_fan_support" (integer), "slots" (integer), "riser_slots" (integer), "front_panel" (text), "included_fans_quantity" (integer)`;

axios.get('https://api.rainforestapi.com/request', { params })
  .then(response => {
    const products = response.data.search_results || [];

    const cleaned = products.map(product => ({
      title: product.title,
      asin: product.asin,
      product_image: product.image,
    }));

    const countFile = 'count.json';
    let totalCount = 0;
    if (fs.existsSync(countFile)) {
      const raw = fs.readFileSync(countFile);
      const parsed = JSON.parse(raw);
      totalCount = parsed.total || 0;
    }

    const content = `
      ${JSON.stringify(cleaned, null, 2)}
      Hey ! 3 actions to do for each ${brand} ${category}:
      1. Filter the product title to create a SQLite query to add all the items to an allready created table called "main" 
      (columns (commas are important to keep) : title (=only the product name and manufacturer) (text), product_image (text), manufacturer (text), color (text), type (=${category}) (text), asin_code (text), year (integer)).

      2. Search for these product specifications (without showing me the results):
      ${specstosearch}

      3. Finally, create a query to add only the specifications to an allready created table called "${specstable}" (columns (commas are important to keep) : ${specstablecolumns}).
      Adding a value called "value" (integer) which goes up for each product, starting from ${totalCount}.

      Thanks for your help!
    `;

    fs.writeFileSync('results.txt', content);
    console.log(`✅ Data saved for brand: ${brand}`);

    const currentCount = cleaned.length;
    totalCount += currentCount;
    fs.writeFileSync(countFile, JSON.stringify({ total: totalCount }, null, 2));
  })
  .catch(error => {
    console.error("❌ Error:", error.message);
  });
