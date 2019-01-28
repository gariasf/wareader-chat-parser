# WhatsApp Chat Parser

> A package to parse WhatsApp chat logs 💬

## Install

```
$ npm install whatsapp-chat-parser-alt
```
or
```
$ yarn add whatsapp-chat-parser-alt
```

## Usage

```javascript
const whatsapp = require('whatsapp-chat-parser');

whatsapp
  .parseString([raw whatsapp conversation])
  .then(result => {
    // Do whatever you want with result
  })
  .catch(err => {
    // Something went wrong
  });
```

The `result` variable is an object like this:

```javascript
{
  messages: [
    {
      date: '2018-06-02T22:45:00.000Z', // Date object
      author: 'Luke',
      message: 'Hey how are you?',
      dateString: '02-06-2018', // Computed with toLocaleDateString() using 'en-BG'
      dateDay: 6,
      time: '22:45', // Computed with toLocaleDateString() using 'en-BG'
      isPreviousAuthor: false, // Previous author is the same as the current one,
      isNextAuthor: false // Next author is the same as the current one
    },
    {
      date: '2018-06-02T23:48:00.000Z', // Date object
      author: 'Joe',
      message: 'All good, thanks',
      dateString: '02-06-2018', // Computed with toLocaleDateString() using 'en-BG'
      dateDay: 6,
      time: '23:48', // Computed with toLocaleDateString() using 'en-BG'
      isPreviousAuthor: false, // Previous author is the same as the current one
      isNextAuthor: false // Next author is the same as the current one
    },
  ],
  authorList: [ // 'System' user is not added to this array
    'Luke',
    'Joe'
  ],
  isGroup: false
};
```

In the case of a system message, the author will be `System`

```javascript
[
  {
    date: '2018-06-02T22:45:00.000Z', // Date object
    author: 'System',
    message: 'You created group "Party 🎉"',
    dateString: '02-06-2018', // Computed with toLocaleDateString() using 'en-BG'
    dateDay: 6,
    time: '22:45', // Computed with toLocaleDateString() using 'en-BG'
    isPreviousAuthor: false, // Previous author is the same as the current one
    isNextAuthor: false // Next author is the same as the current one
  },
];
```

## API

### parseString(string, [options]) → Promise

**string**

Type: `string`

Raw string of the WhatsApp conversation

**options**

Type: `object`

## Options

<!-- prettier-ignore-start -->
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| daysFirst | `Boolean` | `undefined` | Specify if your log file's date starts with a day (`true`) or a month (`false`). Manually specifying this may improve performance. By default the program will try to infer this information using 3 different methods (look at [`date.js`](src/date.js) for the implementation), if all fails it defaults to interpret the first digit as the day. |
<!-- prettier-ignore-end -->

## Technologies used

- Testing: [Jest](https://jestjs.io/)
- Code formatting: [Prettier](https://prettier.io/)
- Linting: [ESLint](https://eslint.org/) (with [Airbnb rules](https://www.npmjs.com/package/eslint-config-airbnb-base))

## Requirements

`Node.js >= 8.0.0`

## Changelog

[CHANGELOG](CHANGELOG.md)

## License

[MIT](LICENSE)
