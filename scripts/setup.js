const { MeiliSearch } = require('meilisearch')
const moviesEn = require('../assets/movies-en-US.json')
const moviesJp = require('../assets/movies-ja-JP.json')
const moviesTh = require('../assets/movies-th-TH.json')

require('dotenv').config()

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
})

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
  await Promise.all(
    indexes.map(async index => {
      const currentIndex = client.index(index.indexName)
      await currentIndex.updateSettings(settings)
      await currentIndex.addDocuments(index.documents)
      console.log(`Documents added to ${index.indexName} index`)
    })
  )
}


// const waitForVariableToBeSet = (variable) => {
//   return new Promise((resolve, reject) => {
//     // Check the variable at regular intervals
//     const checkInterval = setInterval(() => {
//       if (variable !== undefined) {
//         console.log(variable)
//         clearInterval(checkInterval); // Stop checking
//         resolve();
//       }
//     }, 1000); // Adjust the interval as needed
//   });
// }

try {
  setup()
} catch {
  console.warn('Meilisearch is not ready yet. Skipping indexing...');
}
