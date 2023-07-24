const { MeiliSearch } = require('meilisearch')
const moviesEn = require('../assets/movies-en-US.json')
const moviesJp = require('../assets/movies-ja-JP.json')
const moviesTh = require('../assets/movies-th-TH.json')
const watchTasks = require('./utils')
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

const credentials = {
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY
}

const setup = async () => {
  try {
    console.log('🚀 Seeding your Meilisearch instance')

    if (!credentials.host) {
      throw new Error('Missing `MEILISEARCH_HOST` environment variable')
    }

    if (!credentials.apiKey) {
      throw new Error('Missing `MEILISEARCH_ADMIN_KEY` environment variable')
    }

    const client = new MeiliSearch(credentials)

    try {
      await client.health()
    } catch (error) {
      throw new Error('Meilisearch index is not ready. Skipping indexing...')
    }

    await Promise.all(
      indexes.map(async index => {
        const currentIndexName = index.indexName
        const currentIndex = client.index(currentIndexName)
        console.log(`Adding settings to \`${currentIndexName}\``)
        await currentIndex.updateSettings(settings)
        console.log(`Adding documents to \`${currentIndexName}\``)
        await currentIndex.addDocuments(index.documents)
        await watchTasks(client, currentIndexName)
      })
    )
  } catch (error) {
    console.error(error)
  }
}

setup()

module.exports = setup
