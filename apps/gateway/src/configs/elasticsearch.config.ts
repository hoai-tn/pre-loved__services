// src/config/elasticsearch.config.ts
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

// const elasticsearchUsername = process.env.ELASTICSEARCH_USERNAME;
// const elasticsearchPassword = process.env.ELASTICSEARCH_PASSWORD;

export const elasticsearchConfig: ElasticsearchModuleOptions = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  maxRetries: 3,
  requestTimeout: 10000,
  sniffOnStart: false, // disable sniffing on start because we are using single node
  sniffOnConnectionFault: false, // disable sniffing on connection fault because we are using single node
};
