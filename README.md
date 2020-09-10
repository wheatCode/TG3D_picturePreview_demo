# Labeling Tool

## Design

### Backend

* RESTful API server built with `express`, wrapped with `serverless` framework
* Use `sequalize` for ORM to store data (MySQL for production, sqlite for local development)
* Use `JWT` for API authorization
* Deploy to AWS Lambda

### Frontend

* A `vue` SPA app built with `vuetify` UI framework
* Reuse several components from `recipe`
* Local development managed by `vue-cli`
* Deploy to AWS S3
