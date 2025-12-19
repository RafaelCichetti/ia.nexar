/*
  Migração de dados entre bancos MongoDB (source -> destination)
  - Lê variáveis de ambiente:
    SOURCE_MONGO_URI (ex: mongodb://localhost:27017/saas-ia-whatsapp)
    SOURCE_DB_NAME   (opcional; se ausente usa o db da URI)
    DEST_MONGO_URI   (ex: mongodb+srv://user:pass@cluster/db?opts)
    DEST_DB_NAME     (opcional; se ausente usa o db da URI)
    DROP_DEST        ("1" para limpar destino antes de inserir)

  Uso:
    NODE_ENV=development node scripts/migrate-db.js

  Observações:
    - Não commit secrets (.env). Configure as variáveis no ambiente.
    - Copia coleções, índices e documentos em lotes.
*/

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

function log(msg) {
  console.log(`[migrate] ${msg}`);
}

function err(msg) {
  console.error(`[migrate] ERROR: ${msg}`);
}

async function ensureIndexes(sourceCol, destCol) {
  const idx = await sourceCol.indexes();
  for (const i of idx) {
    if (i.name === '_id_') continue;
    const { key, name } = i;
    const options = { name };
    if (i.unique === true) options.unique = true;
    if (i.sparse === true) options.sparse = true; // somente seta se for boolean true
    if (typeof i.expireAfterSeconds === 'number') options.expireAfterSeconds = i.expireAfterSeconds;
    if (i.partialFilterExpression && typeof i.partialFilterExpression === 'object') options.partialFilterExpression = i.partialFilterExpression;
    if (i.collation && typeof i.collation === 'object') options.collation = i.collation;
    // 'background' é obsoleto/ignorado em versões modernas; não incluir
    try {
      await destCol.createIndex(key, options);
    } catch (e) {
      const msg = String(e.message || '');
      if (msg.includes('already exists')) continue;
      // Em caso de erro por opções inválidas, tenta criar somente com name
      try {
        await destCol.createIndex(key, { name });
      } catch (e2) {
        if (String(e2.message || '').includes('already exists')) continue;
        throw e2;
      }
    }
  }
}

async function copyCollection(sourceDb, destDb, name, dropDest) {
  const sourceCol = sourceDb.collection(name);
  const destCol = destDb.collection(name);

  if (dropDest) {
    try {
      await destCol.drop();
      log(`Coleção destino dropada: ${name}`);
    } catch (_) {
      /* ignore */
    }
  }

  // Garante criação explícita da coleção no destino
  const colls = await destDb.listCollections({ name }, { nameOnly: true }).toArray();
  if (!colls.length) {
    await destDb.createCollection(name);
    log(`Coleção criada no destino: ${name}`);
  }

  await ensureIndexes(sourceCol, destDb.collection(name));

  const cursor = sourceCol.find({}, { noCursorTimeout: true });
  const batch = [];
  let total = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    batch.push(doc);
    if (batch.length >= 1000) {
      await destDb.collection(name).insertMany(batch, { ordered: false });
      total += batch.length;
      batch.length = 0;
      log(`Coleção ${name}: ${total} documentos copiados...`);
    }
  }
  if (batch.length) {
    await destDb.collection(name).insertMany(batch, { ordered: false });
    total += batch.length;
  }
  log(`Coleção ${name}: migração concluída (${total} docs).`);
}

function getDb(client, explicitName) {
  return explicitName ? client.db(explicitName) : client.db();
}

async function main() {
  const SOURCE_MONGO_URI = process.env.SOURCE_MONGO_URI || 'mongodb://localhost:27017/saas-ia-whatsapp';
  const SOURCE_DB_NAME = process.env.SOURCE_DB_NAME || '';
  const DEST_MONGO_URI = process.env.DEST_MONGO_URI;
  const DEST_DB_NAME = process.env.DEST_DB_NAME || '';
  const DROP_DEST = String(process.env.DROP_DEST || '0') === '1';

  if (!DEST_MONGO_URI) {
    err('DEST_MONGO_URI não definida. Abortei.');
    process.exit(1);
  }
  if (/[<>]/.test(DEST_MONGO_URI) || DEST_MONGO_URI.includes('<cluster>') || DEST_MONGO_URI.includes('<user>') || DEST_MONGO_URI.includes('<pass>') || DEST_MONGO_URI.includes('<db>')) {
    err('DEST_MONGO_URI contém placeholders (<user>, <pass>, <cluster>, <db>). Substitua por valores reais do Atlas.');
    process.exit(1);
  }
  log(`Conectando source: ${SOURCE_MONGO_URI}${SOURCE_DB_NAME ? '/' + SOURCE_DB_NAME : ''}`);
  log(`Conectando destino: ${DEST_MONGO_URI}${DEST_DB_NAME ? '/' + DEST_DB_NAME : ''}`);

  const sourceClient = new MongoClient(SOURCE_MONGO_URI);
  const destClient = new MongoClient(DEST_MONGO_URI);
  try {
    await sourceClient.connect();
    await destClient.connect();
    const sourceDb = getDb(sourceClient, SOURCE_DB_NAME);
    const destDb = getDb(destClient, DEST_DB_NAME);

    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();
    if (!collections.length) {
      log('Nenhuma coleção encontrada no banco de origem. Nada a migrar.');
      return;
    }
    log(`Coleções encontradas: ${collections.map(c => c.name).join(', ')}`);

    for (const { name } of collections) {
      await copyCollection(sourceDb, destDb, name, DROP_DEST);
    }

    log('Migração concluída com sucesso.');
  } catch (e) {
    err(e && e.stack ? e.stack : e);
    process.exitCode = 1;
  } finally {
    await sourceClient.close().catch(() => {});
    await destClient.close().catch(() => {});
  }
}

main();
