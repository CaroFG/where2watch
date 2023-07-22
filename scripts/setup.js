const { MeiliSearch } = require('meilisearch')
const moviesEn = require('../assets/movies-en-US.json')
const moviesJp = require('../assets/movies-ja-JP.json')
const moviesTh = require('../assets/movies-th-TH.json')
require('dotenv').config()

const indexes = [
  {
    indexName: 'movies-en-US',
    documents: moviesEn,
  },
  {
    indexName: 'movies-ja-JP',
    documents: moviesJp,
  },
  {
    indexName: 'movies-th-TH',
    documents: moviesTh,
  },
]

const settings = {
  rankingRules: [
    'typo',
    'words',
    'proximity',
    'attribute',
    'exactness',
    'release_date:desc',
    'popularity:desc',
  ],
  searchableAttributes: ['title'],
}

const setup = async () => {
  const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
})

  await Promise.all(
    indexes.map(async index => {
      const currentIndex = client.index(index.indexName)
      await currentIndex.updateSettings(settings)
      await currentIndex.addDocuments(index.documents)
      console.log(`Documents added to ${index.indexName} index`)
    })
  )
}

const waitForVariableToBeSet = (variable, maxWaitTime) => {
  let resolved = false;

  return new Promise((resolve, reject) => {
    // Check the variable at regular intervals
    console.log('Waiting for environment variables to be set')
    const checkInterval = setInterval(() => {
      if (variable !== undefined) {
        console.log(variable)
        clearInterval(checkInterval); // Stop checking
        resolved = true;
        resolve(variable);
      }
    }, 1000); // Adjust the interval as needed

    // Set a timeout to reject the Promise if the maxWaitTime is exceeded
    setTimeout(() => {
      if (!resolved) {
        clearInterval(checkInterval);
        reject(new Error('Timeout: Variables not set within the maximum wait time.'));
      }
    }, maxWaitTime);
  });
};

try {
  waitForVariableToBeSet(process.env.MEILISEARCH_URL, 300000).then(setup);
} catch (e) {
  console.error(e);
}
