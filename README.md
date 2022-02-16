# pagopa-checkout-backend-mock

**Table of contents**
 * [Prerequisites](#prerequisites)
   * [Environment variables](#environment-variables)
 * [Running locally](#running-locally)
   * [Running with docker and docker-compose](#running-with-docker-and-docker-compose)
   * [Running without docker](#running-without-docker)

Mock of backend services used by pagopa Checkout.

## Prerequisites

 * [nodejs](http://nodejs.org)
 * [docker](https://www.docker.com) (optional, recommended)

### Environment variables

This mock uses the following environment variables:

| Name                           | Description                                                     | Required |
|--------------------------------|-----------------------------------------------------------------|----------|
| PAGOPA_FUNCTIONS_CHECKOUT_HOST | (†) Host of pagoPA functions supporting pagoPA Checkout backend | Yes      |
| PAGOPA_FUNCTIONS_CHECKOUT_PORT | (†) Port of pagoPA functions supporting pagoPA Checkout backend | Yes      |

(†): please refer to [this repo](https://github.com/pagopa/pagopa-functions-checkout)

You must set up environment variables by creating a `.env` file. You can use the provided example file as such to get default values for these variables:

```shell
$ cp env.example .env
```


## Running locally

You can run the mock either with or without docker-compose.

### Running with docker and docker-compose

Build the package and the docker image with

```shell
$ yarn build && docker-compose build
```

then

```shell
$ docker-compose up
```

in the repo root.

### Running without docker
Build the package with

```shell
$ yarn build
```

then, if for some reason you don't want to run the project with docker, you can use this one-liner:

```shell
$  (export $(grep -v '^#' .env | xargs) && yarn start)
```