---

# @nephelaiio/cloudflare-api

An opinionated wrapper for Cloudflare's v4 API.

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub issues](https://img.shields.io/github/issues/nephelaiio/node-cloudflare-api)

## Description

This package provides an basic interface to interact with Cloudflare's API, with
built-in functionality like error handling, retries, and pagination handling.

## Installation

To add this package to your project, simply run:

```bash
npm install @nephelaiio/cloudflare-api
```

## Usage

```javascript
import { api } from '@nephelaiio/cloudflare-api';

const options = {
  token: 'YOUR_CLOUDFLARE_TOKEN',
  path: '/zones'
};

async function fetchZones() {
  const data = await api(options);
  console.log(data);
}

fetchZones();
```

### API Options

- `token`: Your Cloudflare API token.
- `path`: The API endpoint path.
- `method`: HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`).
- `body`: Request body, if any.
- `ignore_errors`: An array of HTTP status codes that should not be treated as
  errors.

## Dependencies

This package has a dependency on `@nephelaiio/logger` for logging purposes.

## Reporting Bugs

For bug reports, please open an issue on
[GitHub](https://github.com/nephelaiio/node-cloudflare-api/issues).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to
discuss what you'd like to change.

Ensure your code adheres to our linting and test guidelines:

```bash
make lint
make test
```

## TODO

- Use
  [OpenAPI Typescript fetch generator](https://openapi-generator.tech/docs/generators/typescript-fetch)
  along with Cloudflare's
  [OpenAPI schemas](https://github.com/cloudflare/api-schemas) to auto-generate
  complete type aware interface to v4 API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
