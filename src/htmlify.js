const anchorme = require('anchorme').default;

const REGEX_MARKDOWN_BOLD = /(\s)?\*(.*?)\*/gm;
const REGEX_MARKDOWN_ITALIC = /(\s)?_(.*?)_/gm;
const REGEX_MARKDOWN_STRIKETHROUGH = /(\s)?~(.*?)~/gm;
const REGEX_MARKDOWN_MONOSPACE = /(\s)?```(.*?)```/gm;

function htmlifyMarkdown(string) {
  return string
    .replace(REGEX_MARKDOWN_STRIKETHROUGH, '$1<s>$2</s>')
    .replace(REGEX_MARKDOWN_BOLD, '$1<b>$2</b>')
    .replace(REGEX_MARKDOWN_ITALIC, '$1<i>$2</i>')
    .replace(REGEX_MARKDOWN_MONOSPACE, '$1<tt>$2</tt>');
}

function htmlfyUrls(string) {
  return anchorme(string, {
    attributes: [
      {
        name: 'target',
        value: '_blank',
      },
    ],
  });
}

function stringifyMediaOmmited(string) {
  return string.replace(/<Media omitted>/gm, 'Media ommited');
}

module.exports = function htmlifyMessage(messageString) {
  let computedString = messageString;
  computedString = htmlfyUrls(computedString);
  computedString = htmlifyMarkdown(computedString);
  computedString = stringifyMediaOmmited(computedString);

  return computedString;
};
