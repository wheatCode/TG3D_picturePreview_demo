### Getting Started

1. ``yarn install`` to install all dependency packages

1. ``yarn run db:init`` to setup sqlite db and run db migrations and seeds

1. ``yarn start`` to start the server

### Envs

* ``MTM_API_ENDPOINT`` needed for correct MTM api endpoint

* ``MTM_API_KEY`` needed for using MTM apis

* ``HASH_SALT`` needed for hashing id

* ``AUTH_KEY`` needed for jwt secret key

* ``DB_USERNAME`` needed for production db setup

* ``DB_PASSWORD`` needed for production db setup

* ``DB_NAME`` database name. needed for production db setup

* ``DB_HOST`` database host. needed for production db setup. example: ``localhost``

* ``DB_PORT`` database port. needed for production db setup. example: ``3306``

* ``LABEL_TIMEOUT`` the wait timeout (in seconds) for a dispatched image can be labeled again. example: ``60``

* ``AWS_ACCESS_KEY_ID`` aws credentials needed for s3 access

* ``AWS_SECRET_ACCESS_KEY`` aws credentials needed for s3 access

* ``AWS_S3_BUCKET_NAME`` name of the s3 bucket

For local development, create an ``.env`` file and set the above envs
